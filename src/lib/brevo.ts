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
  const logoLightUrl = `${absoluteSite}/brand/logo-full-light.png`;
  const rawSkinType = payload.skinType || "mixta";
  const displaySkinType = rawSkinType.toLowerCase().replace(/^piel\s+/, "").trim();
  const whatsappUrl = `https://wa.me/50254222180?text=${encodeURIComponent(
    `¡Hola! Hice el test de piel Aphros para ${payload.toName} y mi diagnóstico es piel ${displaySkinType}. Me gustaría recibir asesoría sobre mis productos recomendados:`,
  )}`;

  const productCards = payload.products
    .map((product) => {
      const imageSrc = toPublicImageUrl(product.imageUrl, absoluteSite) || "";
      const imageHtml = imageSrc
        ? `<td width="88" valign="top" style="padding-right:16px;">
             <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(product.name)}" width="84" height="84" style="display:block;width:84px;height:84px;object-fit:cover;border-radius:14px;border:1px solid #ead2c8;background:#fcece6;" />
           </td>`
        : "";

      return `
      <tr>
        <td style="padding-bottom:14px;">
          <div style="background:#ffffff;border:1px solid #ead2c8;border-radius:18px;padding:18px 20px;">
            <!-- Category Tag & Price -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
              <tr>
                <td>
                  <span style="display:inline-block;background:#f4ddd5;color:#52232d;border:1px solid #ead2c8;font-size:10.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:3px 10px;border-radius:999px;">
                    ${escapeHtml(product.category || "Recomendado")}
                  </span>
                </td>
                <td align="right" style="font-size:14.5px;font-weight:700;color:#42281f;">
                  ${escapeHtml(product.currency)} ${product.price.toFixed(2)}
                </td>
              </tr>
            </table>

            <!-- Product info with optional photo -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${imageHtml}
                <td valign="top">
                  <h4 style="margin:0 0 6px;font-family:Georgia,serif;font-size:17px;font-weight:normal;color:#3b1820;line-height:1.28;">
                    ${escapeHtml(product.name)}
                  </h4>
                  <p style="margin:0;font-size:12.5px;color:#7d6159;line-height:1.55;">
                    ${escapeHtml(product.description)}
                  </p>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu rutina personalizada Aphros</title>
</head>
<body style="margin:0;padding:0;background-color:#fcece6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Gmail teaser preview text -->
  <div style="display:none;font-size:1px;color:#fcece6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Hola ${escapeHtml(payload.toName)}, aquí tienes tu diagnóstico y rutina personalizada preparados por Aphros.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fcece6;padding:32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border:1px solid #ead2c8;border-radius:26px;overflow:hidden;box-shadow:0 8px 30px rgba(66,40,31,0.08);">
          
          <!-- Header Banner Borgoña Oficial -->
          <tr>
            <td style="background-color:#3b1820;background:linear-gradient(155deg,#4b1f29 0%,#3b1820 60%,#2f1219 100%);padding:38px 24px 34px;text-align:center;">
              <div style="margin-bottom:12px;">
                <img src="${escapeHtml(logoLightUrl)}" alt="APHROS" width="140" style="display:inline-block;width:140px;height:auto;max-width:100%;" />
              </div>
              <p style="margin:0;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#f4ddd5;font-weight:500;">
                eres arte y queremos cuidarte
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:34px 28px 26px;">

              <!-- Greeting -->
              <p style="margin:0 0 10px;font-size:17px;font-weight:600;color:#3b1820;">
                Hola, ${escapeHtml(payload.toName)}
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#7d6159;line-height:1.65;">
                Diseñamos esta rutina artesanal con mucho amor y cuidado para acompañar tu día a día, restaurando el balance y bienestar natural de tu piel.
              </p>

              <!-- Diagnostic Hero Box -->
              <div style="background:#fff9f7;border:1px solid #f4ddd5;border-radius:20px;padding:24px;margin-bottom:30px;text-align:center;">
                <span style="display:inline-block;background:#f4ddd5;color:#52232d;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:3px 12px;border-radius:999px;margin-bottom:12px;">
                  Diagnóstico Personalizado
                </span>
                <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#3b1820;text-transform:capitalize;">
                  Piel ${escapeHtml(displaySkinType)}
                </h2>
                <div style="width:40px;height:1px;background:#bc8b87;margin:0 auto 12px;opacity:0.6;"></div>
                <p style="margin:0;font-size:13.5px;color:#5c3b31;line-height:1.65;max-width:440px;margin-left:auto;margin-right:auto;">
                  ${escapeHtml(payload.summary)}
                </p>
              </div>

              <!-- Recommended Products Title -->
              <div style="margin-bottom:18px;">
                <h3 style="margin:0 0 4px;font-family:Georgia,serif;font-size:20px;font-weight:normal;color:#3b1820;">
                  Tu Rutina Recomendada
                </h3>
                <p style="margin:0;font-size:12.5px;color:#7d6159;">
                  Productos seleccionados artesanalmente pensando exclusivamente en lo que tu piel necesita:
                </p>
              </div>

              <!-- Product Cards Table (sin "¿Por qué este producto?") -->
              <table width="100%" cellpadding="0" cellspacing="0">
                ${productCards}
              </table>

            </td>
          </tr>

          <!-- WhatsApp Direct Consultation Support -->
          <tr>
            <td style="background-color:#fff8f5;border-top:1px solid #ead2c8;padding:28px 26px;text-align:center;">
              <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#3b1820;">
                ¿Tienes dudas sobre cómo empezar tu rutina?
              </p>
              <p style="margin:0 0 16px;font-size:13px;color:#7d6159;line-height:1.55;max-width:440px;margin-left:auto;margin-right:auto;">
                Escríbenos a nuestro WhatsApp oficial (+502 5422-2180) para recibir asesoría directa y resolver cualquier consulta sobre la aplicación de tus productos.
              </p>
              <a href="${escapeHtml(whatsappUrl)}" target="_blank" style="display:inline-block;padding:12px 28px;background:#52232d;color:#ffffff;text-decoration:none;border-radius:999px;font-size:13px;font-weight:600;letter-spacing:0.04em;">
                Consultar por WhatsApp (+502 5422-2180)
              </a>
            </td>
          </tr>

          <!-- Footer Signature -->
          <tr>
            <td style="padding:24px;text-align:center;font-size:11.5px;color:#8a7670;background-color:#fcece6;">
              <p style="margin:0 0 4px;font-weight:600;color:#3b1820;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">
                APHROS · Cosmética Natural Artesanal
              </p>
              <p style="margin:0 0 8px;line-height:1.5;color:#7d6159;">
                Formulaciones naturales conscientes elaboradas en Guatemala.
              </p>
              <p style="margin:0;">
                <a href="${absoluteSite}" style="color:#52232d;text-decoration:underline;font-weight:500;">Visitar tienda en línea</a>
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
          subject: `${payload.toName}, aquí tienes tu rutina personalizada Aphros`,
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

    return { sent: true as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al enviar correo";
    return { sent: false as const, reason: message };
  }
}
