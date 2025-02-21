// components/UserProvider.tsx
// 'use client';
// import { useAuth } from "@clerk/nextjs";
// import { useEffect } from "react";

// interface UserProviderProps {
//   onUserIdChange: (userId: string | undefined |  null) => void;
//   children: React.ReactNode;
// }

// export default function UserProvider({ onUserIdChange, children }: UserProviderProps) {
//   const { userId } = useAuth();

//   useEffect(() => {
//     onUserIdChange(userId);
//   }, [userId, onUserIdChange]);

//   return <>{children}</>;
// }



// components/UserProvider.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

// نوع داده‌ای برای Context
interface UserContextType {
  userId: string | null | undefined;
}

// ساخت Context برای userId
const UserContext = createContext<UserContextType>({
  userId: null,
});

// استفاده از Context
export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: React.ReactNode;
}

export default function UserProvider({ children }: UserProviderProps) {
  const { userId } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(null);

  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
      console.log("User ID changed:", userId); // برای تست
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId: currentUserId }}>
      {children}
    </UserContext.Provider>
  );
}
