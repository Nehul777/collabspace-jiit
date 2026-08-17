"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "595343737681-e40rdigjto1gfvfjnrcla4fbak5k1o22.apps.googleusercontent.com";

export function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleCredentialResponse = async (response: any) => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      if (!response.credential) {
        throw new Error("No credential received from Google.");
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: response.credential,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        const email = data.session.user.email;
        if (!email || !email.endsWith("@mail.jiit.ac.in")) {
          await supabase.auth.signOut();
          setErrorMsg("Access restricted: Only @mail.jiit.ac.in emails are allowed.");
          setIsLoading(false);
          return;
        }

        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Google ID Token Login Error:", err);
      setErrorMsg(err.message || "Failed to sign in with Google.");
      setIsLoading(false);
    }
  };

  const initGoogleIdentity = () => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "rectangular",
          text: "signin_with",
          logo_alignment: "left",
          width: 380,
        });
      }

      // Also trigger One-Tap prompt for quick login
      window.google.accounts.id.prompt();
    } catch (e) {
      console.error("Error initializing Google Identity Services:", e);
    }
  };

  useEffect(() => {
    if (scriptLoaded) {
      initGoogleIdentity();
    }
  }, [scriptLoaded]);

  const handleFallbackOAuth = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            hd: "mail.jiit.ac.in",
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate login.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      {errorMsg && (
        <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Native Google Identity Services Button */}
      <div
        ref={buttonRef}
        className={`w-full flex justify-center min-h-[44px] transition-opacity ${
          isLoading ? "opacity-50 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* Fallback button if script hasn't rendered yet */}
      {!scriptLoaded && (
        <button
          onClick={handleFallbackOAuth}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
        </button>
      )}
    </div>
  );
}

