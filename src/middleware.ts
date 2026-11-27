import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  checkRateLimit,
  getClientIp,
  isSearchCrawler,
  isSuspiciousBot,
} from "@/lib/rate-limit";

const COOKIE_NAME = "aphros_admin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";
  const ip = getClientIp(request.headers);
  const method = request.method.toUpperCase();

  // 1. RATE LIMITING Y PROTECCIÓN CONTRA BOTS EN TODAS LAS RUTAS DE API
  if (pathname.startsWith("/api/")) {
    const isBot = isSuspiciousBot(userAgent);
    const isCrawler = isSearchCrawler(userAgent);

    // Bloquear bots o crawlers que intentan enviar formularios POST a endpoints de IA o login
    if ((isBot || isCrawler) && method === "POST") {
      return NextResponse.json(
        { error: "Acceso no permitido para solicitudes automatizadas." },
        { status: 403 },
      );
    }

    // Configuración de límites por endpoint
    let limit = 60; // 60 req/min por defecto
    let windowMs = 60 * 1000;
    let actionKey = "general";

    if (pathname === "/api/recommend") {
      // Endpoint de IA (Gemini): 5 recomendaciones cada 10 minutos por IP
      limit = isBot ? 1 : 5;
      windowMs = 10 * 60 * 1000;
      actionKey = "recommend";
    } else if (pathname === "/api/admin/login") {
      // Intentos de login: máximo 5 cada 15 minutos por IP (anti fuerza bruta)
      limit = 5;
      windowMs = 15 * 60 * 1000;
      actionKey = "login";
    } else if (pathname.startsWith("/api/media")) {
      // Proxy de imágenes: 120 por minuto
      limit = 120;
      windowMs = 60 * 1000;
      actionKey = "media";
    }

    const rateResult = checkRateLimit({
      key: `${ip}:${actionKey}`,
      limit,
      windowMs,
    });

    if (!rateResult.success) {
      return NextResponse.json(
        {
          error:
            "Demasiadas solicitudes. Por favor espera antes de intentar nuevamente.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateResult.resetSeconds.toString(),
            "X-RateLimit-Limit": rateResult.limit.toString(),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }
  }

  // 2. AUTENTICACIÓN Y PROTECCIÓN DEL PANEL DE ADMINISTRACIÓN
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/api/admin/login") {
      return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;
    const secret = process.env.ADMIN_SECRET;

    if (!token || !secret) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
