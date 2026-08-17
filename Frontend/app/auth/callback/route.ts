import { NextRequest, NextResponse } from "next/server";
import { verifyEmailAction } from "@/actions/auth.actions";

// Handles the redirect from Supabase after email verification.
// Supabase calls: /auth/callback?email=<encoded-email>[#access_token=...]
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (email) {
    await verifyEmailAction(decodeURIComponent(email));
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("verified", "1");
  if (email) loginUrl.searchParams.set("email", decodeURIComponent(email));

  return NextResponse.redirect(loginUrl);
}
