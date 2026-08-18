"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ClientCallbackHandler() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleToken = async () => {
      try {
        // The id_token comes in the URL hash, e.g. #id_token=eyJ...
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");
        const error = params.get("error");

        if (error) {
          throw new Error(error);
        }

        if (!idToken) {
          // If no token, maybe they were redirected here by mistake
          router.push("/login");
          return;
        }

        // Retrieve the nonce we stored before redirecting
        const nonce = window.localStorage.getItem("supabase_auth_nonce");

        const supabase = createClient();
        const { data, error: signInError } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: idToken,
          nonce: nonce || undefined, // Provide the raw nonce so Supabase can hash it and match
        });

        // Clean up the nonce
        window.localStorage.removeItem("supabase_auth_nonce");

        if (signInError) throw signInError;

        if (data.session) {
          const email = data.session.user.email;
          if (!email || !email.endsWith("@mail.jiit.ac.in")) {
            await supabase.auth.signOut();
            setErrorMsg("Access restricted: Only @mail.jiit.ac.in emails are allowed.");
            setTimeout(() => router.push("/login"), 3000);
            return;
          }

          router.push("/");
          router.refresh();
        }
      } catch (err: any) {
        console.error("Callback processing error:", err);
        setErrorMsg(err.message || "Failed to process login.");
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleToken();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08090A]">
      <div className="bg-[#0F1115]/80 p-8 rounded-2xl border border-white/10 text-center max-w-md w-full">
        {errorMsg ? (
          <div className="text-red-400 font-medium">{errorMsg}</div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/70">Completing login...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#08090A]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ClientCallbackHandler />
    </Suspense>
  );
}
