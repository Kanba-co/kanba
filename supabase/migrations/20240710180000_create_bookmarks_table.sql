-- Bookmarks tablosu
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  icon_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Kullanıcı sadece kendi bookmarklarını görebilsin
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE TO authenticated USING (user_id = auth.uid()); 