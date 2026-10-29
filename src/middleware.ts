import { NextResponse, type NextRequest } from 'next/server';

/**
 * Validates whether a token exists, has 3 JWT segments, and is not expired.
 */
function isTokenValid(token: string | undefined): boolean {
	if (!token || typeof token !== 'string') return false;
	const parts = token.trim().split('.');
	if (parts.length !== 3) return false;
	try {
		const base64Url = parts[1];
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				.join('')
		);
		const payload = JSON.parse(jsonPayload);
		if (payload.exp && Date.now() >= payload.exp * 1000) {
			return false;
		}
		return true;
	} catch {
		return false;
	}
}

export function middleware(req: NextRequest) {
	const { pathname, search } = req.nextUrl;

	const token = req.cookies.get('token')?.value;
	const authenticated = isTokenValid(token);

	// 1. Root /admin or /admin/
	if (pathname === '/admin' || pathname === '/admin/') {
		if (authenticated) {
			return NextResponse.redirect(new URL('/admin/dashboard', req.url));
		}
		return NextResponse.redirect(new URL('/admin/login', req.url));
	}

	// 2. /admin/login
	if (pathname === '/admin/login') {
		if (authenticated) {
			return NextResponse.redirect(new URL('/admin/dashboard', req.url));
		}
		return NextResponse.next();
	}

	// 3. All other /admin/* routes
	if (pathname.startsWith('/admin/')) {
		if (!authenticated) {
			const loginUrl = new URL('/admin/login', req.url);
			const callbackUrl = pathname + search;
			loginUrl.searchParams.set('callbackUrl', callbackUrl);
			const response = NextResponse.redirect(loginUrl);
			if (token) {
				response.cookies.delete('token');
			}
			return response;
		}
		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin', '/admin/:path*'],
};
