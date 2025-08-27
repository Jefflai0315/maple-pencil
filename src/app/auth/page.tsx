"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupFlow, setIsSignupFlow] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const { data: session, status } = useSession() as {
    data: { user: { email: string; name: string } } | null;
    status: string;
  };
  const router = useRouter();

  // Check for AccessDenied error in URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get("error");
      if (error === "AccessDenied") {
        setIsSignupFlow(true);
        console.log("Access denied - redirecting to signup");
      }
    }
  }, [session, isSignupFlow]);

  // Check if authenticated user exists in database
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;

    const checkUserInDatabase = async () => {
      try {
        const res = await fetch("/api/check-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });

        if (!res.ok) return;

        const { exists } = await res.json();
        if (!exists) {
          console.log("User not in database, redirecting to auth");
          router.push("/auth?error=AccessDenied");
        } else {
          console.log("User exists in database, redirecting to upload");
          router.push("/upload");
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };

    checkUserInDatabase();
  }, [status, session?.user?.email, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // Simple: just sign in with Google
      const result = await signIn("google", { callbackUrl: "/upload" });
      if (result?.error) {
        console.error("Sign in error:", result.error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!session?.user?.email || !session?.user?.name) {
      console.error("❌ No session data available");
      return;
    }
    setIsCreatingAccount(true);

    try {
      const response = await fetch("/api/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
        }),
      });

      const responseText = await response.text();

      if (response.ok) {
        // Clear the error parameter and redirect to upload page
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("error");
          window.history.replaceState({}, "", url.toString());
        }
        router.push("/upload");
      } else {
        console.error(
          "❌ Failed to create account:",
          response.status,
          responseText
        );
        alert(`Failed to create account: ${responseText}`);
      }
    } catch (error) {
      console.error("❌ Error creating account:", error);
      alert(`Error creating account: ${error}`);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-200 to-blue-500">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center organic-paper p-4"
      style={{
        backgroundImage: "url('/sketch/mural.png')",
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full bg-white/85 p-6 rounded-lg shadow-lg text-center">
        {!isSignupFlow ? (
          // Login Flow
          <>
            <h2 className="text-2xl font-bold text-charcoal-dark font-handwritten">
              Join Our Creative Community
            </h2>
            <span className="text-charcoal-medium font-handwritten text-xl">
              playing with pencil
            </span>
            <p className="text-charcoal-medium my-4 font-body">
              Sign in to share your artwork and be part of our digital mural
            </p>

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="sketch-btn w-full py-3 px-6 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </div>
            </button>

            <p className="text-xs text-charcoal-light mt-4 font-body">
              By signing in, you agree to our terms of service and privacy
              policy
            </p>
          </>
        ) : (
          // Signup Flow (Access Denied)
          <>
            <h2 className="text-2xl font-bold text-charcoal-dark font-handwritten">
              Welcome to Our Community!
            </h2>
            <span className="text-charcoal-medium font-handwritten text-xl">
              playing with pencil
            </span>
            {session?.user ? (
              // User has session - show account creation
              <>
                <p className="text-charcoal-medium my-4 font-body">
                  Hi {session.user.name}! Let&apos;s set up your account so you
                  can start sharing your artwork.
                </p>

                <button
                  onClick={handleCreateAccount}
                  disabled={isCreatingAccount}
                  className="sketch-btn w-full py-3 px-6 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isCreatingAccount ? (
                      <>
                        <div className="w-5 h-5 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating your account...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <span>Create My Account</span>
                      </>
                    )}
                  </div>
                </button>
              </>
            ) : (
              // No session - need to authenticate first
              <>
                <p className="text-charcoal-medium my-4 font-body">
                  You need to sign in with Google first to create your account.
                </p>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="sketch-btn w-full py-3 px-6 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-charcoal-dark border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.85-2.22.81-.62z"
                          />
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </div>
                </button>
              </>
            )}

            <div className="mt-4 p-3 bg-charcoal-light/20 rounded-lg">
              <p className="text-xs text-charcoal-medium font-body">
                <strong>What you&apos;ll get:</strong>
                <br />
                • 0 starting credits
                <br />
                • Access to &quot;Sembawang-west&quot; board
                <br />
                • Ability to upload artwork
                <br />• Join our creative community
              </p>
            </div>
          </>
        )}

        {/* Back to Home */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            href="/"
            className="text-charcoal-light hover:text-charcoal-dark transition-colors font-body"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
