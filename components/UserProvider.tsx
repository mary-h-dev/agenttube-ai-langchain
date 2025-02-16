// components/UserProvider.tsx
'use client';
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

interface UserProviderProps {
  onUserIdChange: (userId: string | undefined |  null) => void;
  children: React.ReactNode;
}

export default function UserProvider({ onUserIdChange, children }: UserProviderProps) {
  const { userId } = useAuth();

  useEffect(() => {
    onUserIdChange(userId);
  }, [userId, onUserIdChange]);

  return <>{children}</>;
}