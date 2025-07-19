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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useUser();
  const [saving, setSaving] = useState(false);
  const [localName, setLocalName] = useState(user?.full_name || "");

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
    </div>
  );
}
