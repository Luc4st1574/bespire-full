"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import { GET_USER_PROFILE } from "@/graphql/queries/getUserProfile";
import { useQuery } from "@apollo/client";
import { User } from "../types/users";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  loadingLogout: boolean;
  queryLoading: boolean;
  refetchProfile: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const router = useRouter();

  const hasFetchedProfile = useRef(false);

  useEffect(() => {
    const savedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (savedToken && savedToken !== "undefined") {
      setToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const {
    data,
    loading: queryLoading,
    refetch,
  } = useQuery(GET_USER_PROFILE, {
    skip: !token || hasFetchedProfile.current,
    fetchPolicy: "network-only",
    pollInterval: 0,
  });

  useEffect(() => {
    if (
      token &&
      data?.getUserProfile &&
      !queryLoading &&
      !hasFetchedProfile.current
    ) {
      const userPreferences =
        typeof data.getUserProfile.preferences === "string"
          ? JSON.parse(data.getUserProfile.preferences || "{}")
          : data.getUserProfile.preferences || {};

      setUser({
        _id: data.getUserProfile._id,
        email: data.getUserProfile.email,
        firstName: data.getUserProfile.firstName,
        lastName: data.getUserProfile.lastName,
        avatarUrl: data.getUserProfile.avatarUrl,
        teamRole: data.getUserProfile.teamRole,
        registrationStatus: data.getUserProfile.registrationStatus,
        hasVisitedDashboard: data.getUserProfile?.hasVisitedDashboard,
        role: data.getUserProfile?.role,
        workspaceSelected: data.getUserProfile?.workspaceSelected || null,
        preferences: userPreferences,
      });
      setLoading(false);
      hasFetchedProfile.current = true;
    }

    if (
      token &&
      !data?.getUserProfile &&
      !queryLoading &&
      !hasFetchedProfile.current
    ) {
      setUser(null);
      setLoading(false);
      hasFetchedProfile.current = true;
      router.replace("/auth/login");
    }
  }, [token, data, queryLoading, router]);

  useEffect(() => {
    if (!token) {
      hasFetchedProfile.current = false;
      setUser(null);
    }
  }, [token]);

  const login = useCallback((newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    hasFetchedProfile.current = false;
    setLoading(true);
  }, []);

  const logout = useCallback(async () => {
    setLoadingLogout(true);
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    hasFetchedProfile.current = false;
    await new Promise((resolve) => setTimeout(resolve, 100));
    setLoadingLogout(false);
    router.replace("/auth/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      loading,
      loadingLogout,
      queryLoading,
      refetchProfile: refetch,
    }),
    [user, token, login, logout, loading, loadingLogout, queryLoading, refetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}