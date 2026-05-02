import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ─── Route Configuration ────────────────────────────────────────────────────

const PROTECTED_ROUTES = [
	"/chat",
	"/find-users",
	"/settings",
	"/profile",
	"/user", // covers /user/[username]
];

const AUTH_ROUTES = [
	"/login",
	"/signup",
	"/forgot-password",
	"/reset-password",
	"/verify-otp",
	"/verify-reset-otp",
	"/update-password",
];

// ─── JWT Verification ────────────────────────────────────────────────────────

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function verifyToken(cookieHeader: string | null): Promise<boolean> {
	if (!cookieHeader) return false;

	// Extract token value from cookie string e.g. "token=abc123; other=xyz"
	const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
	if (!match?.[1]) return false;

	try {
		await jwtVerify(match[1], SECRET);
		return true;
	} catch {
		// Token is expired, tampered, or invalid
		return false;
	}
}

// ─── Middleware ──────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const isProtected = PROTECTED_ROUTES.some((route) =>
		pathname.startsWith(route)
	);
	const isAuthRoute = AUTH_ROUTES.some((route) =>
		pathname.startsWith(route)
	);
	// Not a route we care about — skip
	if (!isProtected && !isAuthRoute) {
		return NextResponse.next();
	}

	const cookieHeader = request.headers.get("cookie");
	const isAuthenticated = await verifyToken(cookieHeader);

	// Protected route + not authenticated → redirect to login
	if (isProtected && !isAuthenticated) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("redirect", pathname); // restore after login
		return NextResponse.redirect(loginUrl);
	}

	// Auth route + already authenticated → redirect to dashboard
	if (isAuthRoute && isAuthenticated) {
		return NextResponse.redirect(new URL("/chat", request.url));
	}

	return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────────────
// Only runs middleware on these paths — static files, _next, api routes are
// automatically excluded. This keeps the app fast.

export const config = {
	matcher: [
		"/chat/:path*",
		"/find-users/:path*",
		"/settings/:path*",
		"/profile/:path*",
		"/user/:path*",
		"/login",
		"/signup",
		"/forgot-password",
		"/reset-password",
		"/verify-otp",
		"/verify-reset-otp",
		"/update-password",
	],
};
