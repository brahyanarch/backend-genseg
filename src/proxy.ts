import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/modules/auth/infrastructure/cookie/session-cookie.constants";
import { isJwtExpired } from "@/modules/auth/infrastructure/jwt";

// En Next 16 `middleware` se renombró a `proxy`. Aquí hacemos comprobaciones
// "optimistas": solo miramos si hay un token no expirado en la cookie. La
// autorización real la impone el backend en cada petición.

const LOGIN_PATH = "/login";
const INTRANET_PREFIX = "/intranet";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = !!token && !isJwtExpired(token);

  const { pathname } = request.nextUrl;
  const isIntranet = pathname.startsWith(INTRANET_PREFIX);
  const isLogin = pathname === LOGIN_PATH;

  // Ruta protegida sin sesión válida -> al login.
  if (isIntranet && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  // Ya autenticado y visitando el login -> a la intranet.
  if (isLogin && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = INTRANET_PREFIX;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/intranet/:path*", "/login"],
};
