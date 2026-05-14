import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "../api/client.js";
import { AuthContext } from "./auth-context.js";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        let accessToken = getStoredToken();

        if (!accessToken) {
          const refreshResponse = await api.post("/auth/refresh");
          accessToken = refreshResponse.data?.data?.accessToken;

          if (accessToken) {
            setStoredToken(accessToken);
          }
        }

        if (accessToken) {
          const response = await api.get("/auth/me");

          if (mounted) {
            setUser(response.data?.data?.user || null);
          }
        }
      } catch {
        clearStoredToken();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    
    if (response.data?.data?.requiresOtp) {
      return response.data.data;
    }

    const nextToken = response.data?.data?.accessToken;
    const nextUser = response.data?.data?.user;

    if (nextToken) {
      setStoredToken(nextToken);
    }

    setUser(nextUser);
    toast.success(`Welcome back, ${nextUser?.name?.split(" ")[0] || "there"}.`);
    return nextUser;
  };

  const verifyOtp = async (payload) => {
    const response = await api.post("/auth/verify-otp", payload);
    const nextToken = response.data?.data?.accessToken;
    const nextUser = response.data?.data?.user;

    if (nextToken) {
      setStoredToken(nextToken);
    }

    setUser(nextUser);
    toast.success(`Welcome back, ${nextUser?.name?.split(" ")[0] || "there"}.`);
    return nextUser;
  };

  const resendOtp = async (payload) => {
    const response = await api.post("/auth/resend-otp", payload);
    toast.success(response.data?.message || "OTP resent successfully.");
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    
    if (response.data?.data?.requiresEmailVerification) {
      toast.success(response.data.message || "Please check your email.");
      return response.data.data;
    }

    const nextToken = response.data?.data?.accessToken;
    const nextUser = response.data?.data?.user;

    if (nextToken) {
      setStoredToken(nextToken);
    }

    setUser(nextUser);
    toast.success("Your account is ready.");
    return nextUser;
  };

  const resendVerificationEmail = async (payload) => {
    const response = await api.post("/auth/resend-verification-email", payload);
    toast.success(response.data?.message || "Verification email sent.");
    return response.data;
  };

  const forgotPassword = async (payload) => {
    const response = await api.post("/auth/forgot-password", payload);
    toast.success(response.data?.message || "Password reset link sent.");
    return response.data;
  };

  const resetPassword = async (payload) => {
    const response = await api.post("/auth/reset-password", payload);
    toast.success(response.data?.message || "Password reset successful.");
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearStoredToken();
      setUser(null);
      toast.success("Signed out.");
    }
  };

  const refreshProfile = async () => {
    const response = await api.get("/auth/me");
    const nextUser = response.data?.data?.user || null;
    setUser(nextUser);
    return nextUser;
  };

  const updateProfile = async (payload) => {
    const response = await api.patch("/auth/me", payload);
    const nextUser = response.data?.data?.user || null;
    setUser(nextUser);
    toast.success("Profile updated.");
    return nextUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        verifyOtp,
        resendOtp,
        resendVerificationEmail,
        forgotPassword,
        resetPassword,
        refreshProfile,
        updateProfile,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
