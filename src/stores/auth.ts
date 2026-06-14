import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/streaming";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  signInMock: () => void;
  signOut: () => void;
}

/**
 * Auth store — mock implementation. The shape mirrors a JWT access/refresh
 * flow so wiring real endpoints later is a drop-in change.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      signInMock: () =>
        set({
          user: {
            id: "demo-user",
            name: "Astra Voss",
            email: "astra@moviesalert.io",
            avatarUrl: "https://i.pravatar.cc/120?img=47",
          },
          accessToken: "mock.access.token",
          refreshToken: "mock.refresh.token",
          isAuthenticated: true,
        }),
      signOut: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: "moviesalert:auth" },
  ),
);
