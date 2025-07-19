"use client";

import { useTheme } from "next-themes";
import { useUser } from "@/components/user-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useUser();
  const [saving, setSaving] = useState(false);
  const [localName, setLocalName] = useState(user?.full_name || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const form = useForm({
    defaultValues: {
      full_name: localName,
    },
    values: {
      full_name: localName,
    },
  });

  // Settings sayfası her açıldığında Supabase'den güncel profil bilgisini çek
  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (!error && data?.full_name) {
        setLocalName(data.full_name);
        form.setValue("full_name", data.full_name);
      }
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function onSubmit(values: { full_name: string }) {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: values.full_name })
      .eq("id", user?.id);
    setSaving(false);
    if (error) {
      toast.error("Name update failed: " + error.message);
    } else {
      setLocalName(values.full_name);
      toast.success("Name updated successfully!");
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const userId = user?.id;
      if (!userId) throw new Error("Kullanıcı bulunamadı");
      // 1. İlişkili tablolardaki user_id, created_by, updated_by, assigned_to, invited_by alanlarını null yap
      await supabase.from("projects").update({ user_id: null, created_by: null, updated_by: null }).eq("user_id", userId);
      await supabase.from("columns").update({ created_by: null, updated_by: null }).in("created_by", [userId]);
      await supabase.from("columns").update({ created_by: null, updated_by: null }).in("updated_by", [userId]);
      await supabase.from("tasks").update({ created_by: null, updated_by: null, assigned_to: null }).or(`created_by.eq.${userId},updated_by.eq.${userId},assigned_to.eq.${userId}`);
      await supabase.from("project_members").update({ user_id: null, invited_by: null }).or(`user_id.eq.${userId},invited_by.eq.${userId}`);
      await supabase.from("task_comments").update({ user_id: null }).eq("user_id", userId);
      await supabase.from("activity_logs").update({ user_id: null }).eq("user_id", userId);
      await supabase.from("notifications").update({ user_id: null }).eq("user_id", userId);
      await supabase.from("stripe_customers").update({ user_id: null }).eq("user_id", userId);
      await supabase.from("profiles").delete().eq("id", userId);
      // 2. Supabase Auth'dan kullanıcıyı silmek için API route'a istek at
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kullanıcı silinemedi");
      toast.success("Hesabınız silindi. Giriş ekranına yönlendiriliyorsunuz.");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: any) {
      toast.error("Hesap silme başarısız: " + err.message);
    }
    setDeleting(false);
    setDeleteDialogOpen(false);
  }

  return (
    <div className="max-w-lg mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Theme Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
        <span className="font-medium">Theme</span>
        <div className="flex items-center gap-2">
          <span className="text-sm">Light</span>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            id="theme-toggle"
          />
          <span className="text-sm">Dark</span>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/30">
        <Avatar className="h-14 w-14">
          {user?.avatar_url ? (
            <AvatarImage src={user.avatar_url} alt={localName || user.email || "User"} />
          ) : (
            <AvatarFallback>{localName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-semibold text-lg">{localName || "Anonymous User"}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      {/* Name Change Form */}
      <div className="p-4 border rounded-xl bg-muted/30">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...form.register("full_name", { required: "Name is required" })}
                  placeholder="Enter your new name"
                  disabled={loading || saving}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <Button type="submit" disabled={loading || saving}>
              {saving ? "Saving..." : "Update Name"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Hesap Silme */}
      <div className="p-4 border rounded-xl bg-red-50 dark:bg-red-900/20 mt-8">
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full" onClick={() => setDeleteDialogOpen(true)}>
              Hesabımı Sil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hesabını silmek istediğine emin misin?</DialogTitle>
              <DialogDescription>
                Bu işlem geri alınamaz. Hesabını silmek için <b>confirm</b> yaz ve onayla.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="confirm"
              disabled={deleting}
              className="mt-4"
            />
            <DialogFooter>
              <Button
                variant="destructive"
                disabled={deleteConfirm !== "confirm" || deleting}
                onClick={handleDeleteAccount}
              >
                {deleting ? "Siliniyor..." : "Hesabımı Kalıcı Olarak Sil"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
