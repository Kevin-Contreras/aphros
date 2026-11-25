import { NextResponse } from "next/server";
import { getBrevoConfigStatus } from "@/lib/brevo";
import { getDatabaseUrl, getDirectDatabaseUrl } from "@/lib/database-url";

export async function GET() {
  const brevo = getBrevoConfigStatus();
  const dbUrl = getDatabaseUrl();
  const directUrl = getDirectDatabaseUrl();

  return NextResponse.json({
    ok: true,
    database: {
      runtimeUrlPresent: Boolean(dbUrl),
      directUrlPresent: Boolean(directUrl),
      host: (dbUrl || directUrl).replace(/^.*@/, "").replace(/\/.*$/, "") || null,
    },
    brevo: {
      apiKeyPresent: brevo.apiKeyPresent,
      senderEmailPresent: brevo.senderEmailPresent,
      senderEmailValid: brevo.senderEmailValid,
      ready: brevo.ready,
    },
    gemini: {
      apiKeyPresent: Boolean(process.env.GEMINI_API_KEY?.trim()),
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    },
  });
}
