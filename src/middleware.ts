// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const token = await getToken({ req: request });
//   const url = request.nextUrl;

//   if (!token) {
//     if (
//       url.pathname.startsWith("/dashboard") ||
//       url.pathname.startsWith("/verify") ||
//       url.pathname.startsWith("/suggest-messages")
//     ) {
//       return NextResponse.redirect(new URL("/sign-in", request.url)); // ✅ Redirect to "/sign-in"
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/sign-in",
//     "/sign-up",
//     "/dashboard/:path*",
//     "/verify/:path*",
//     "/suggest-messages",
//     "/api/auth/:path*", // ✅ Allow API requests in Postman
//   ],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return NextResponse.next(); // ✅ Allow all requests without restrictions
}

export const config = {
  matcher: [], // ✅ No routes are protected
};
