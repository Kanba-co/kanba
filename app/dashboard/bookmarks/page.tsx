"use client";

import { useUser } from "@/components/user-provider";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { format } from 'date-fns';


async function fetchMeta(url: string) {
  // Basit bir metadata fetcher (OpenGraph)
  try {
    const res = await fetch(`/api/fetch-meta?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}


export default function BookmarksPage() {
  const { user, loading } = useUser();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setBookmarks(data || []));
  }, [user]);

  async function handleAddBookmark() {
    setError("");
    if (!url.trim() || !user) return;
    setAdding(true);
    // URL'yi normalize et
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
    }
    // Metadata çek
    const meta = await fetchMeta(normalizedUrl);
    const { title, icon, description } = meta || {};
    const { error: insertError, data } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        url: normalizedUrl,
        title: title || normalizedUrl,
        icon_url: icon || '',
        description: description || '',
      })
      .select()
      .single();
    setAdding(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setBookmarks([data, ...bookmarks]);
    setUrl("");
  }

  // Bookmarkları günlere göre gruplandır
  function groupByDate(bookmarks: any[]) {
    const groups: Record<string, any[]> = {};
    for (const b of bookmarks) {
      const date = format(new Date(b.created_at), 'd MMMM yyyy');
      if (!groups[date]) groups[date] = [];
      groups[date].push(b);
    }
    return groups;
  }
  // Arama filtresi
  const filtered = bookmarks.filter(b => {
    const q = search.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
    );
  });
  const grouped = groupByDate(filtered);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold">Bookmarks</h1>
      <div className="mb-6">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search bookmarks..."
          />
        </div>
      </div>
      <div className="max-w-2xl mx-auto py-10 space-y-8">
        
        <div className="flex gap-2 min-w-[250px]">
          <Input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter website URL"
            disabled={adding}
          />
          <Button onClick={handleAddBookmark} disabled={adding || !url.trim()}>
            {adding ? "Adding..." : "Add Bookmark"}
          </Button>
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <div className="space-y-8">
          {Object.keys(grouped).length === 0 && <div className="text-muted-foreground">No bookmarks yet.</div>}
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="font-semibold text-base text-muted-foreground mb-2">{date}</div>
              <div className="space-y-2">
                {items.map(b => (
                  <div key={b.id} className="p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition flex items-center gap-4">
                    <div className="flex flex-col items-center mr-2">
                      {b.icon_url && (
                        <a href={b.url} target="_blank" rel="noopener noreferrer">
                          <Image src={b.icon_url} alt="icon" width={42} height={42} className="rounded-md border p-1" />
                        </a>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-lg line-clamp-1 hover:underline"
                      >
                        {b.title || b.url}
                      </a>
                      <div className="text-xs text-muted-foreground line-clamp-2">{b.description}</div>
                      <div className="text-xs text-muted-foreground mt-1 break-all">{b.url}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
