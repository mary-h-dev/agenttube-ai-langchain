"use client";

import Header from "@/components/Header";
import { Authenticated } from "convex/react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <Authenticated>
        <h1>heloo</h1>
        {/* <Sidebar/> */}
        <div className="bg-red-500 flex-1">
          <Header />
          <main>{children}</main>
        </div>
      </Authenticated>
    </div>
  );
}
