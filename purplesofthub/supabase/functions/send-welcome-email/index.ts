import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-secret",
};

type WelcomePayload = {
  user_id?: string;
  email?: string;
  first_name?: string;
};

const BRAND_PURPLE = "#7c3aed";
const BRAND_CYAN = "#22d3ee";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildWelcomeHtml(firstName?: string): string {
  const safeName = firstName ? escapeHtml(firstName) : "there";

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>Welcome to PurpleSoftHub</title>
    </head>
    <body style="margin:0;padding:0;background:#070511;font-family:Inter,Arial,sans-serif;color:#e9e4ff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#070511;padding:32px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:linear-gradient(165deg,#0f0b1f 0%,#0a0817 100%);border:1px solid rgba(124,58,237,.35);border-radius:20px;overflow:hidden;">
              <tr>
                <td style="padding:28px 28px 18px 28px;border-bottom:1px solid rgba(124,58,237,.2);">
                  <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${BRAND_CYAN};font-weight:700;">PurpleSoftHub</div>
                  <h1 style="margin:10px 0 0 0;font-size:28px;line-height:1.2;color:#ffffff;">Welcome, ${safeName} ??</h1>
                  <p style="margin:10px 0 0 0;color:#c6b8ef;font-size:15px;line-height:1.6;">
                    You are officially in. We are excited to help you build, launch, and grow something amazing.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding:24px 28px 8px 28px;">
                  <p style="margin:0 0 12px 0;color:#f5f3ff;font-weight:700;font-size:15px;">Here is what you can do next:</p>
                  <ul style="margin:0;padding-left:18px;color:#cfc4f4;font-size:14px;line-height:1.8;">
                    <li>Start your first project request from your dashboard</li>
                    <li>Explore our services and pricing plans</li>
                    <li>Track progress and manage your work in one place</li>
                  </ul>
                </td>
              </tr>

              <tr>
                <td style="padding:20px 28px 8px 28px;">
                  <a href="https://www.purplesofthub.com/dashboard"
                     style="display:inline-block;background:linear-gradient(135deg,${BRAND_PURPLE},#a855f7);color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:12px;box-shadow:0 8px 24px rgba(124,58,237,.35);">
                    Go to Dashboard
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding:16px 28px 26px 28px;">
                  <p style="margin:0;color:#a99dd1;font-size:13px;line-height:1.8;">
                    Quick links:
                    <a href="https://www.purplesofthub.com/services" style="color:${BRAND_CYAN};text-decoration:none;">Services</a>
                    ·
                    <a href="https://www.purplesofthub.com/services/web-development/pricing" style="color:${BRAND_CYAN};text-decoration:none;">Pricing</a>
                    ·
                    <a href="https://www.purplesofthub.com/academy" style="color:${BRAND_CYAN};text-decoration:none;">Academy</a>
                  </p>
                  <p style="margin:14px 0 0 0;color:#8e82b8;font-size:12px;line-height:1.6;">
                    Need help? Reply to this email or reach us at hello@purplesofthub.com.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFrom = Deno.env.get("RESEND_FROM_EMAIL") || "PurpleSoftHub <hello@purplesofthub.com>";
    const secret = Deno.env.get("WELCOME_FUNCTION_SECRET");

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (secret) {
      const requestSecret = req.headers.get("x-function-secret");
      if (!requestSecret || requestSecret !== secret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const payload = (await req.json()) as WelcomePayload;
    const email = payload.email?.trim();

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: [email],
      subject: "Welcome to PurpleSoftHub – Let's Build Something Great ??",
      html: buildWelcomeHtml(payload.first_name),
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
