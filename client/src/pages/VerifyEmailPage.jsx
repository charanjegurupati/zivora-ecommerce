import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client.js";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Please wait while we verify your email...");

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        if (mounted) {
          setStatus("error");
          setMessage("Invalid verification link. Missing token or email.");
        }
        return;
      }

      try {
        const response = await api.post("/auth/verify-email", { email, token });
        if (mounted) {
          setStatus("success");
          setMessage(response.data.message || "Email verified successfully!");
        }
      } catch (error) {
        if (mounted) {
          setStatus("error");
          setMessage(error.response?.data?.message || "Failed to verify email. The link may have expired.");
        }
      }
    };

    verify();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  return (
    <section className="page-section flex min-h-[60vh] items-center justify-center">
      <div className="surface-panel max-w-md p-10 text-center">
        {status === "verifying" && (
          <>
            <h1 className="display-title mb-4 text-2xl font-semibold text-ink-950">Verifying Email</h1>
            <p className="text-sm leading-7 text-slate-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-honey-100 text-honey-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="display-title mb-4 text-2xl font-semibold text-ink-950">Verified!</h1>
            <p className="mb-8 text-sm leading-7 text-slate-600">{message}</p>
            <Link
              to="/auth"
              className="inline-block rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-sand-50"
            >
              Sign in now
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="display-title mb-4 text-2xl font-semibold text-ink-950">Verification Failed</h1>
            <p className="mb-8 text-sm leading-7 text-slate-600">{message}</p>
            <Link
              to="/auth"
              className="inline-block rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-sand-50"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
