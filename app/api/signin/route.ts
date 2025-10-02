import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      message: 'User authenticated',
      user: {
        id: user.id,
        email: user.email,
        name: profile?.name || '',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    return NextResponse.json({
      message: 'Signed in',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: profile?.name || '',
      },
    });
  } catch (err) {
    console.error('Sign in error:', err);
    return NextResponse.json({ error: 'Sign in failed' }, { status: 500 });
  }
}
