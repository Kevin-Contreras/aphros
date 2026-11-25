import { BrevoClient } from "@getbrevo/brevo";

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

export async function sendRecommendationEmail(payload: RecommendationEmailPayload) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Aphros";

  if (!apiKey || !senderEmail) {
    return { sent: false as const, reason: "Brevo no configurado" };
  }

  const productBlocks = payload.products
    .map(
      (product) => `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #e8e2d6;">
          <p style="margin:0 0 6px;font-size:16px;font-weight:600;color:#2f3d2c;">${product.name}</p>
          <p style="margin:0 0 8px;font-size:14px;color:#5c6558;line-height:1.5;">${product.description}</p>
          ${
            product.reason
              ? `<p style="margin:0 0 8px;font-size:13px;color:#7a6a4f;"><em>${product.reason}</em></p>`
              : ""
          }
          <p style="margin:0 0 10px;font-size:14px;color:#2f3d2c;">${product.currency}${product.price.toFixed(2)}</p>
          <a href="${product.buyUrl}" style="display:inline-block;padding:10px 16px;background:#6b8f71;color:#fff;text-decoration:none;border-radius:999px;font-size:13px;">Ver en Pacifiko</a>
        </td>
      </tr>`,
    )
    .join("");

  const tips = payload.tips.map((tip) => `<li style="margin:0 0 8px;">${tip}</li>`).join("");

  const htmlContent = `
  <div style="font-family:Georgia,serif;background:#f7f3ea;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #e8e2d6;padding:32px;">
      <p style="margin:0 0 4px;letter-spacing:0.18em;text-transform:uppercase;font-size:12px;color:#6b8f71;">Aphros</p>
      <h1 style="margin:0 0 16px;font-size:28px;color:#2f3d2c;">Tu rutina de cuidado</h1>
      <p style="margin:0 0 12px;font-size:15px;color:#5c6558;">Hola ${payload.toName},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#5c6558;line-height:1.6;">${payload.summary}</p>
      <p style="margin:0 0 24px;font-size:14px;color:#2f3d2c;"><strong>Tipo de piel estimado:</strong> ${payload.skinType}</p>
      <h2 style="margin:0 0 8px;font-size:18px;color:#2f3d2c;">Productos recomendados</h2>
      <table width="100%" cellpadding="0" cellspacing="0">${productBlocks}</table>
      <h2 style="margin:28px 0 8px;font-size:18px;color:#2f3d2c;">Tips Aphros</h2>
      <ul style="padding-left:18px;color:#5c6558;font-size:14px;line-height:1.5;">${tips}</ul>
      <p style="margin:28px 0 0;font-size:12px;color:#8a8376;">Cosmética artesanal guatemalteca · Aphros</p>
    </div>
  </div>`;

  const brevo = new BrevoClient({ apiKey });
  const result = await brevo.transactionalEmails.sendTransacEmail({
    sender: { name: senderName, email: senderEmail },
    to: [{ email: payload.toEmail, name: payload.toName }],
    subject: "Tu rutina Aphros según tu piel",
    htmlContent,
  });

  return { sent: true as const, messageId: result.messageId };
}
