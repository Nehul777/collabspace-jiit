import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // Prevent open redirect: only allow relative paths
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // Enforce mail.jiit.ac.in domain
      const email = session?.user?.email;
      if (!email || !email.endsWith("@mail.jiit.ac.in")) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=domain_not_allowed`);
      }
      
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  // Redirect to error page if auth failed or no code provided
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
