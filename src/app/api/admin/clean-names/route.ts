import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify Admin
  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!currentUserProfile?.is_admin) {
    return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
  }

  // Fetch all profiles
  const { data: profiles, error: fetchError } = await supabase.from("profiles").select("id, display_name");
  if (fetchError || !profiles) {
    return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 });
  }

  let updatedCount = 0;

  for (const profile of profiles) {
    if (!profile.display_name) continue;
    
    // Clean name by removing single quotes, smart quotes, and numbers at the end
    const cleanName = profile.display_name.replace(/[0-9'’‘]+.*$/, '').trim();

    if (cleanName !== profile.display_name) {
      await supabase.from("profiles").update({ display_name: cleanName }).eq("id", profile.id);
      updatedCount++;
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: `Successfully cleaned ${updatedCount} student names automatically.` 
  });
}
