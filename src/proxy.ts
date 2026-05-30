import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Allow Next.js internals, public files, and API routes
	if (
		pathname.startsWith('/_next') ||
		pathname.startsWith('/api') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/assets') ||
		PUBLIC_FILE.test(pathname)
	) {
		return NextResponse.next();
	}

	// Protect /admin routes (except the login page)
	if (pathname.startsWith('/admin')) {
		// Allow access to login page
		if (pathname === '/admin/login') {
			return NextResponse.next();
		}

		// For other admin routes, let the client-side authentication handle the redirect
		// The ProtectedRoute component and AuthContext will handle authentication checks
		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*'],
};

