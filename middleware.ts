import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("pb_session")?.value);

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("redirect", pathname);
    return NextResponse.redirect(login);
  }
  if ((pathname === "/auth/login" || pathname === "/auth/register") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  // Authorization is verified against the database in app/admin/layout.tsx.
  // Middleware only performs the inexpensive session-presence gate.
  if (pathname.startsWith("/admin") && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
