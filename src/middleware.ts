import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  if (host.startsWith("app.") && pathname === "/") {
    return NextResponse.rewrite(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
