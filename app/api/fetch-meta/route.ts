import { NextRequest, NextResponse } from 'next/server';

const LINKPREVIEW_API_KEY = 'f1d1a164d43d02d2c9664f68043d0eaa';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'No url' }, { status: 400 });

  try {
    const res = await fetch(`https://api.linkpreview.net/?key=${LINKPREVIEW_API_KEY}&q=${encodeURIComponent(url)}`);
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch meta' }, { status: 500 });
    const data = await res.json();

    // Favicon fallback
    let favicon = data.icon;
    if (!favicon) {
      try {
        const u = new URL(url);
        favicon = `${u.origin}/favicon.ico`;
      } catch {
        favicon = '';
      }
    }

    return NextResponse.json({
      title: data.title,
      description: data.description,
      icon: favicon,
      ogImage: data.image, // opsiyonel: büyük og:image görseli
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch meta' }, { status: 500 });
  }
} 