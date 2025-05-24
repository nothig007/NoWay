import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export { default } from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

  const token = await getToken({req: request})
  const url = request.nextUrl
  if(token){
    if(token.provider ==="github"){
        if(token.username===""){
          return NextResponse.redirect(new URL('/confirm-username', request.url));
        }
      }
  }
 if (
    token && 
    !url.pathname.startsWith('/dashboard') && // 🚀 Prevent redirect loop
    (
      url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify') ||
      url.pathname.startsWith('/')
    )
  ) {
    if(token.provider === "github"){
      if(!token.username){
        console.log("Redirecting to /confirm-username...");
        return NextResponse.redirect(new URL('/confirm-username', request.url));
      }
      else{
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    }
    if(token.provider === "google"){
      if(!token.username){
        console.log("Redirecting to /confirm-username...");
        return NextResponse.redirect(new URL('/confirm-username', request.url));
      }
      else{
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    }
    console.log("Redirecting to /dashboard...");
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if(token && url.pathname.startsWith('/confirm-username')){
    if(token.provider ==="github"){
      if(token.username!==""){
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }
}
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/dashboard/:path*',
    '/verify/:path*'
  ],
}
