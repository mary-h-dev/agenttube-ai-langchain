// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const { userId } = await auth();

//   return NextResponse.json({
//     userId: userId || "No user found",
//   });
// }

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // داده‌های دریافت‌شده از بدنه (JSON)
    const { userId } = await req.json();

    // اینجا هر کاری لازم است با userId انجام دهید:
    // مثلاً ذخیره در دیتابیس، ارسال به Convex، لاگ گرفتن و غیره
    console.log("Received userId from client:", userId);

    // پاسخ موفقیت‌آمیز
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/test:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
