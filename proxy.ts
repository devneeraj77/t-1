import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_api/")) {
    const rewrittenPath = pathname.replace(/^\/_api\//, "/api/fcc/");
    const url = request.nextUrl.clone();
    url.pathname = rewrittenPath;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/_api/:path*"],
};
