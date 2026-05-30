import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	if (pathname.startsWith('/admin')) {
		// Temporarily disabled authentication check in middleware
		// Allow login route
		// if (pathname.startsWith('/admin/login')) {
		// 	return NextResponse.next();
		// }
		// const token = req.cookies.get('admin_token')?.value;
		// if (!token) {
		// 	const loginUrl = req.nextUrl.clone();
		// 	loginUrl.pathname = '/admin/login';
		// 	loginUrl.searchParams.set('redirect', pathname);
		// 	return NextResponse.redirect(loginUrl);
		// }
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*'],
};