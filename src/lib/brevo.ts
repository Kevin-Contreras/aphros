import { withTimeout } from "@/lib/with-timeout";

type RecommendedProduct = {
  name: string;
  description: string;
  price: number;
  currency: string;
  buyUrl: string;
  reason?: string;
};

type RecommendationEmailPayload = {
  toEmail: string;
  toName: string;
  skinType: string;
  summary: string;
  tips: string[];
  products: RecommendedProduct[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function getBrevoConfigStatus() {
  const apiKey = process.env.BREVO_API_KEY?.trim() || "";
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || "";
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "Aphros";
  const senderValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail);

  return {
    apiKeyPresent: Boolean(apiKey),
    senderEmailPresent: Boolean(senderEmail),
    senderEmailValid: senderValid,
    senderName,
    ready: Boolean(apiKey) && senderValid,
  };
}

export async function sendRecommendationEmail(payload: RecommendationEmailPayload) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "Aphros";

  if (!apiKey) {
    return { sent: false as const, reason: "BREVO_API_KEY ausente" };
  }
  if (!senderEmail) {
    return { sent: false as const, reason: "BREVO_SENDER_EMAIL ausente" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
    return {
      sent: false as const,
      reason: "BREVO_SENDER_EMAIL debe ser un correo verificado, no una API key",
    };
  }

  const productBlocks = payload.products
    .map(
      (product) => `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #e8e2d6;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#2f3d2c;">${escapeHtml(product.name)}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#5c6558;line-height:1.5;">${escapeHtml(product.description)}</p>
          ${
            product.reason
              ? `<p style="margin:0 0 8px;font-size:13px;color:#7a6a4f;"><em>${escapeHtml(product.reason)}</em></p>`
              : ""
          }
          <p style="margin:0 0 10px;font-size:14px;color:#2f3d2c;">${escapeHtml(product.currency)}${product.price.toFixed(2)}</p>
          <a href="${escapeHtml(product.buyUrl)}" style="display:inline-block;padding:10px 16px;background:#6b8f71;color:#fff;text-decoration:none;border-radius:999px;font-size:13px;">Ver en Pacifiko</a>
        </td>
      </tr>`,
    )
    .join("");

  const tips = payload.tips
    .map((tip) => `<li style="margin:0 0 8px;">${escapeHtml(tip)}</li>`)
    .join("");

  const htmlContent = `
  <div style="font-family:Georgia,serif;background:#f7f3ea;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #e8e2d6;padding:32px;">
      <p style="margin:0 0 4px;letter-spacing:0.18em;text-transform:uppercase;font-size:12px;color:#6b8f71;">Aphros</p>
      <h1 style="margin:0 0 16px;font-size:28px;color:#2f3d2c;">Tu rutina de cuidado</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#5c6558;">Hola ${escapeHtml(payload.toName)},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#5c6558;line-height:1.6;">${escapeHtml(payload.summary)}</p>
      <p style="margin:0 0 24px;font-size:14px;color:#2f3d2c;"><strong>Tipo de piel estimado:</strong> ${escapeHtml(payload.skinType)}</p>
      <h2 style="margin:0 0 8px;font-size:18px;color:#2f3d2c;">Productos recomendados</h2>
      <table width="100%" cellpadding="0" cellspacing="0">${productBlocks}</table>
      <h2 style="margin:28px 0 8px;font-size:18px;color:#2f3d2c;">Tips Aphros</h2>
      <ul style="padding-left:18px;color:#5c6558;font-size:14px;line-height:1.5;">${tips}</ul>
      <p style="margin:28px 0 0;font-size:12px;color:#8a8376;">Cosmética artesanal guatemalteca · Aphros</p>
    </div>
  </div>`;

  try {
    const response = await withTimeout(
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: payload.toEmail, name: payload.toName }],
          subject: "Tu rutina Aphros según tu piel",
          htmlContent,
        }),
      }),
      8_000,
      "Brevo",
    );

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        sent: false as const,
        reason: `Brevo HTTP ${response.status}: ${body.slice(0, 180)}`,
      };
    }

    const data = (await response.json().catch(() => ({}))) as {
      messageId?: string;
    };
    return { sent: true as const, messageId: data.messageId };
  } catch (error) {
    return {
      sent: false as const,
      reason: error instanceof Error ? error.message : "Error enviando correo",
    };
  }
}
