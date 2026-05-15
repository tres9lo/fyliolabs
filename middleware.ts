import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { i18n } from "@/i18n";

const intlMiddleware = createMiddleware(i18n);

export async function middleware(request: NextRequest) {
  // Run internationalization middleware first
  const response = intlMiddleware(request);

  // Authentication & Authorization
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Protect dashboard and related routes
  const protectedPaths = ["/dashboard", "/settings", "/files", "/folders", "/search"];
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for static files and API routes (next-intl will handle locale)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
