/**
 * Aphros Bot Detection & In-Memory Sliding-Window Rate Limiter
 * Protege los endpoints sensibles (Gemini API, autenticación, APIs públicas)
 * contra scrapers, crawlers abusivos y ataques de fuerza bruta.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// Almacén en memoria por clave (ej: "ip:recommend")
const rateLimitStore = new Map<string, RateLimitRecord>();

// Limpieza periódica cada 5 minutos para evitar fugas de memoria
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Detecta si el User-Agent corresponde a un bot, scraper o cliente automatizado sospechoso.
 */
export function isSuspiciousBot(userAgent?: string | null): boolean {
  if (!userAgent || userAgent.trim().length === 0) {
    // Peticiones sin User-Agent suelen ser scripts automatizados
    return true;
  }

  const ua = userAgent.toLowerCase();

  // Herramientas comunes de scraping y scripts sin navegador
  const botPatterns = [
    "curl",
    "wget",
    "python",
    "requests",
    "aiohttp",
    "httpx",
    "scrapy",
    "urllib",
    "httpclient",
    "postman",
    "insomnia",
    "headlesschrome",
    "phantomjs",
    "selenium",
    "puppeteer",
    "playwright",
    "go-http-client",
    "axios",
    "node-fetch",
    "java/",
    "apache-httpclient",
    "zgrab",
    "nmap",
    "masscan",
    "bytespider",
    "semrushbot",
    "ahrefsbot",
    "dotbot",
    "mj12bot",
    "petalbot",
  ];

  return botPatterns.some((pattern) => ua.includes(pattern));
}

/**
 * Detecta si es un crawler de motor de búsqueda legítimo (Google, Bing, etc.)
 */
export function isSearchCrawler(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  const searchCrawlers = [
    "googlebot",
    "bingbot",
    "duckduckbot",
    "yandexbot",
    "baiduspider",
    "slurp",
  ];
  return searchCrawlers.some((crawler) => ua.includes(crawler));
}

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Evalúa si una clave ha superado su cuota en una ventana de tiempo deslizante.
 */
export function checkRateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  cleanupExpired();

  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    // Nueva ventana
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  // Ventana activa
  existing.count += 1;
  const resetSeconds = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetSeconds,
  };
}

/**
 * Extrae la IP de origen más confiable de la solicitud
 */
export function getClientIp(headers: Headers): string {
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",").map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}
