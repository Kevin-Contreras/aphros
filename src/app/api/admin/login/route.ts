import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    if (!verifyAdminPassword(body.password)) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
}
