import { NextResponse, type NextRequest } from "next/server";

import { authContainer } from "@/modules/auth/config/container";

/** Clears a rejected or expired session before sending the user to login. */
export async function GET(request: NextRequest) {
  await authContainer.logout.execute();

  return NextResponse.redirect(new URL("/login", request.url), 303);
}
