import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, verifyOtp, resendOtp, resendVerificationEmail, forgotPassword } = useAuth();
  const [mode, setMode] = useState("login");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [otpForm, setOtpForm] = useState({ otp: "", userId: "", email: "" });
  const [otpTimer, setOtpTimer] = useState(0);
  const timerRef = useRef(null);

  const startOtpTimer = () => {
    setOtpTimer(120);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(location.state?.from || "/dashboard", { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  const handleResendOtp = async () => {
    setResending(true);
    try {
      await resendOtp({ userId: otpForm.userId });
      startOtpTimer();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const handleResendEmail = async () => {
    if (!form.email || !form.email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    setResendingEmail(true);
    try {
      await resendVerificationEmail({ email: form.email });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend email.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        const result = await login({
          email: form.email,
          password: form.password,
        });
        if (result?.requiresOtp) {
          setMode("otp");
          setOtpForm({ otp: "", userId: result.userId, email: result.email });
          startOtpTimer();
          return;
        }
      } else if (mode === "register") {
        const result = await register(form);
        if (result?.requiresEmailVerification) {
          setMode("login");
          return;
        }
      } else if (mode === "otp") {
        await verifyOtp({ userId: otpForm.userId, otp: otpForm.otp });
      } else if (mode === "forgot-password") {
        await forgotPassword({ email: form.email });
        setMode("login");
        return;
      }

      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not reach the auth server. Please check the API URL and CORS settings.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-panel-dark px-8 py-10">
          <p className="eyebrow mb-3 text-sand-100/70">Auth flow</p>
          <h1 className="display-title text-4xl font-semibold">JWT login, refresh cookies, and protected routes.</h1>
          <p className="mt-5 text-sm leading-7 text-sand-50/75">
            The frontend is wired for bearer tokens in Axios, automatic refresh attempts, protected
            screens, and role-based admin access.
          </p>
        </div>

        <div className="surface-panel px-8 py-10">
          {mode !== "otp" && mode !== "forgot-password" && (
            <div className="flex gap-2 rounded-full bg-sand-50 p-1">
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize ${
                    mode === item ? "bg-ink-950 text-sand-50" : "text-ink-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "otp" ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter the 6-digit code sent to your email address ({otpForm.email || "..."}).
                </p>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">OTP Code</span>
                  <input
                    value={otpForm.otp}
                    onChange={(event) => setOtpForm((current) => ({ ...current, otp: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </label>
                {/* Countdown Timer */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {otpTimer > 0 ? (
                      <>
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-sm font-semibold tabular-nums ${
                          otpTimer <= 30 ? "text-red-500" : "text-slate-600"
                        }`}>
                          Expires in {String(Math.floor(otpTimer / 60)).padStart(2, "0")}:{String(otpTimer % 60).padStart(2, "0")}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-red-500">OTP expired</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    className="text-sm font-medium text-ink-900 underline hover:text-ink-700 disabled:opacity-50"
                  >
                    {resending ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
              </div>
            ) : mode === "register" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Full name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                  required
                />
              </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Phone number</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                    required
                  />
                </label>
              </>
            ) : mode === "forgot-password" ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                    required
                  />
                </label>
              </div>
            ) : null}
            {mode !== "otp" && mode !== "forgot-password" && (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
                    required
                  />
                </label>
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode("forgot-password")}
                    className="text-sm font-medium text-ink-900 underline hover:text-ink-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-ink-950 px-5 py-4 text-sm font-semibold text-sand-50 disabled:opacity-60"
            >
              {submitting
                ? mode === "login"
                  ? "Signing in..."
                  : mode === "otp"
                    ? "Verifying..."
                    : mode === "forgot-password"
                      ? "Sending link..."
                      : "Creating account..."
                : mode === "login"
                  ? "Sign in"
                  : mode === "otp"
                    ? "Verify OTP"
                    : mode === "forgot-password"
                      ? "Send Reset Link"
                      : "Create account"}
            </button>
            {mode === "login" && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="text-sm font-medium text-ink-900 underline hover:text-ink-700 disabled:opacity-50"
                >
                  {resendingEmail ? "Sending..." : "Didn't receive verification email? Resend"}
                </button>
              </div>
            )}
            {mode === "forgot-password" && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm font-medium text-ink-900 underline hover:text-ink-700"
                >
                  Back to login
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
