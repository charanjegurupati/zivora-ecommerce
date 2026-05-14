import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = searchParams.get("token");
    const e = searchParams.get("email");

    if (!t || !e) {
      setError("Invalid link. Missing reset token or email.");
      return;
    }

    setToken(t);
    setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword({ email, token, newPassword: password });
      navigate("/auth", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <section className="page-section flex min-h-[60vh] items-center justify-center">
        <div className="surface-panel max-w-md p-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="display-title mb-4 text-2xl font-semibold text-ink-950">Invalid Link</h1>
          <p className="mb-8 text-sm leading-7 text-slate-600">{error}</p>
          <Link
            to="/auth"
            className="inline-block rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-sand-50"
          >
            Back to sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section flex min-h-[60vh] items-center justify-center">
      <div className="surface-panel w-full max-w-md px-8 py-10">
        <h1 className="display-title mb-2 text-2xl font-semibold text-ink-950 text-center">Reset Password</h1>
        <p className="text-sm leading-7 text-slate-600 text-center mb-8">
          Enter a new password for {email}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600">New Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
              required
            />
          </label>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-ink-950 px-5 py-4 text-sm font-semibold text-sand-50 disabled:opacity-60 mt-4"
          >
            {submitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </section>
  );
}
