import { getSiteOrigin, toPublicImageUrl } from "@/lib/media-url";
import { withTimeout } from "@/lib/with-timeout";

type RecommendedProduct = {
  name: string;
  category?: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
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

  const absoluteSite = getSiteOrigin() || "https://aphros.vercel.app";

  const productCards = payload.products
    .map((product, idx) => {
      const imageSrc = toPublicImageUrl(product.imageUrl, absoluteSite) || "";
      const imageHtml = imageSrc
        ? `<td width="92" valign="top" style="padding-right:16px;">
             <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(product.name)}" width="88" height="88" style="display:block;width:88px;height:88px;object-fit:cover;border-radius:14px;border:1px solid #e5ded2;background:#f8f6f0;" />
           </td>`
        : "";

      return `
      <tr>
        <td style="padding-bottom:16px;">
          <div style="background:#ffffff;border:1px solid #e6ded1;border-radius:18px;padding:18px 20px;">
            <!-- Step Tag & Price -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
              <tr>
                <td>
                  <span style="display:inline-block;background:#ffede7;color:#8e4f40;border:1px solid #f8d5ca;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:3px 10px;border-radius:12px;">
                    Paso ${idx + 1} · ${escapeHtml(product.category || "Cuidado botánico")}
                  </span>
                </td>
                <td align="right" style="font-size:15px;font-weight:700;color:#2b1f1c;">
                  ${escapeHtml(product.currency)} ${product.price.toFixed(2)}
                </td>
              </tr>
            </table>

            <!-- Product info with optional photo -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${imageHtml}
                <td valign="top">
                  <h4 style="margin:0 0 6px;font-family:Georgia,serif;font-size:18px;font-weight:normal;color:#2b1f1c;line-height:1.25;">
                    ${escapeHtml(product.name)}
                  </h4>
                  <p style="margin:0 0 10px;font-size:13px;color:#6b5853;line-height:1.55;">
                    ${escapeHtml(product.description)}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Botanical Rationale / Why it works -->
            ${
              product.reason
                ? `<div style="margin-top:10px;background:#fff7f4;border-left:3px solid #e09d8c;border-radius:0 10px 10px 0;padding:10px 14px;font-size:12.5px;color:#4a2f27;line-height:1.5;">
                     <strong style="color:#3d241d;">¿Por qué este producto?</strong> ${escapeHtml(product.reason)}
                   </div>`
                : ""
            }
          </div>
        </td>
      </tr>`;
    })
    .join("");

  const tipsList = payload.tips
    .map(
      (tip) => `
      <div style="margin-bottom:10px;display:flex;align-items:flex-start;">
        <span style="display:inline-block;width:18px;color:#b85d43;font-size:15px;line-height:1.4;">✦</span>
        <span style="font-size:13.5px;color:#5c4a45;line-height:1.55;">${escapeHtml(tip)}</span>
      </div>`,
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu ritual botánico Aphros</title>
</head>
<body style="margin:0;padding:0;background-color:#faf4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Gmail teaser preview text -->
  <div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Hola ${escapeHtml(payload.toName)}, aquí tienes tu diagnóstico y ritual botánico personalizado preparado por Aphros.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf4ee;padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border:1px solid #f0e4db;border-radius:24px;overflow:hidden;box-shadow:0 4px 20px rgba(43,31,28,0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color:#2b1e19;padding:36px 24px 30px;text-align:center;">
              <p style="margin:0 0 6px;font-size:10.5px;letter-spacing:0.32em;text-transform:uppercase;color:#fcdfd5;font-weight:600;">
                Cosmética Botánica · Guatemala
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:normal;color:#fdfbf7;letter-spacing:0.06em;">
                APHROS
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:32px 26px 24px;">

              <!-- Greeting -->
              <p style="margin:0 0 12px;font-size:17px;font-weight:600;color:#2b1f1c;">
                Hola, ${escapeHtml(payload.toName)}
              </p>
              <p style="margin:0 0 22px;font-size:14.5px;color:#6b5853;line-height:1.65;">
                Diseñamos esta rutina artesanal con mucho cuidado para acompañar tu cuidado diario y restaurar el balance natural de tu piel con ingredientes botánicos puros.
              </p>

              <!-- Diagnostic Sheet Card -->
              <div style="background:#fff9f7;border:1px solid #f8d5ca;border-radius:18px;padding:22px;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#8e4f40;">
                  Diagnóstico personal
                </p>
                <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:22px;font-weight:normal;color:#2b1f1c;text-transform:capitalize;">
                  Piel ${escapeHtml(payload.skinType)}
                </h2>
                <p style="margin:0;font-size:14px;color:#5c4a45;line-height:1.65;">
                  ${escapeHtml(payload.summary)}
                </p>
              </div>

              <!-- Routine Title -->
              <div style="margin-bottom:18px;">
                <h3 style="margin:0 0 4px;font-family:Georgia,serif;font-size:20px;font-weight:normal;color:#2b1f1c;">
                  Tu Ritual Recomendado
                </h3>
                <p style="margin:0;font-size:13px;color:#786661;">
                  Aplica estos productos en el orden sugerido para obtener los mejores resultados:
                </p>
              </div>

              <!-- Product Cards Table -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${productCards}
              </table>

              <!-- Tips Section -->
              <div style="margin-top:16px;background:#fff8f5;border:1px solid #f8d5ca;border-radius:18px;padding:20px 22px;">
                <h3 style="margin:0 0 12px;font-family:Georgia,serif;font-size:18px;font-weight:normal;color:#2b1f1c;">
                  Consejos para tu ritual
                </h3>
                <div>
                  ${tipsList}
                </div>
              </div>

            </td>
          </tr>

          <!-- Personal Consultation Support -->
          <tr>
            <td style="background-color:#fff8f5;border-top:1px solid #f0e4db;padding:26px 28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#2b1f1c;">
                ¿Tienes dudas sobre cómo empezar tu rutina?
              </p>
              <p style="margin:0 0 16px;font-size:13px;color:#6b5853;line-height:1.5;max-width:440px;margin-left:auto;margin-right:auto;">
                Puedes responder a este correo o escribirnos a nuestro WhatsApp para recibir asesoría personalizada sobre la aplicación de tus productos.
              </p>
              <a href="https://wa.me/50255555555" style="display:inline-block;padding:10px 22px;background:#b85d43;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;">
                Consultar por WhatsApp
              </a>
            </td>
          </tr>

          <!-- Footer Signature -->
          <tr>
            <td style="padding:24px;text-align:center;font-size:11.5px;color:#8a7670;background-color:#faf4ee;">
              <p style="margin:0 0 4px;font-weight:600;color:#4a332c;font-size:12px;letter-spacing:0.04em;">
                Aphros · Cosmética Artesanal
              </p>
              <p style="margin:0 0 8px;line-height:1.5;">
                Formulaciones botánicas conscientes elaboradas en Guatemala.
              </p>
              <p style="margin:0;">
                <a href="${absoluteSite}" style="color:#b85d43;text-decoration:none;font-weight:500;">Visitar sitio web</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
          subject: `${payload.toName}, aquí tienes tu ritual botánico Aphros`,
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
