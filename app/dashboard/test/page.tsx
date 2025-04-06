"use client";
import { useAuth } from "@clerk/nextjs";

export default function MyComponent() {
  const { userId } = useAuth();

  console.log("User ID:", userId);
  
  return <div>User ID: {userId}</div>;
}
