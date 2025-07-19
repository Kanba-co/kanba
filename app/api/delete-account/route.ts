import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service key sadece sunucu ortamında kullanılmalı!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  console.log('Silinecek userId:', userId);
  console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Var' : 'YOK');
  if (!userId) {
    return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
  }
  // Supabase Auth admin ile kullanıcıyı sil
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error('Supabase admin error:', error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 