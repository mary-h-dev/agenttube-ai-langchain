// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const { userId } = await auth();

//   return NextResponse.json({
//     userId: userId || "No user found",
//   });
// }


// app/api/test-auth/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  
  return NextResponse.json({ 
    userId: session.userId,
    sessionId: session.sessionId,
    sessionClaims: session.sessionClaims,
    debug: {
      hasSession: !!session,
      timestamp: new Date().toISOString()
    }
  });
}