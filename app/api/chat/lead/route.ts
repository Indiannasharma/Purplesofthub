import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import ChatLead from "@/lib/models/ChatLead";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = rateLimit(`chatlead:${ip}`, { windowMs: 10 * 60 * 1000, max: 10 });
    if (!rl.ok) {
      const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfterSec },
        { status: 429, headers: { "Retry-After": retryAfterSec.toString() } }
      );
    }
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;

    const body = await req.json();
    const { name, email, summary, handoffTriggered } = body as {
      name?: string;
      email?: string;
      summary?: string;
      handoffTriggered?: boolean;
    };

    await connectDB();
    await ChatLead.create({
      name: name?.trim() ?? "",
      email: email?.trim().toLowerCase() ?? "",
      summary: summary?.trim() ?? "",
      handoffTriggered: handoffTriggered ?? false,
      source: "chatbot",
      status: "new",
    });

    if (EMAIL_USER && EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"PurpleSoftHub Chatbot" <${EMAIL_USER}>`,
          to: "purplesofthub@gmail.com",
          replyTo: email || EMAIL_USER,
          subject: `💬 New Chat Lead — ${name || "Unknown Visitor"}`,
          html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
  <h1 style="color:#a855f7;font-size:22px;margin-bottom:24px;">💬 New Chat Lead — PurpleSoftHub</h1>
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
    <tr>
      <td style="padding:8px 0;color:#9d8fd4;font-size:14px;width:160px;">Name</td>
      <td style="padding:8px 0;color:#fff;font-weight:600;">${name || "Not provided"}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#9d8fd4;font-size:14px;">Email</td>
      <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#a855f7;">${email || "Not provided"}</a></td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#9d8fd4;font-size:14px;">WhatsApp Handoff</td>
      <td style="padding:8px 0;color:${handoffTriggered ? "#86efac" : "#9d8fd4"};">${handoffTriggered ? "✅ Yes — User requested WhatsApp" : "No"}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#9d8fd4;font-size:14px;">Source</td>
      <td style="padding:8px 0;color:#fff;">Puri Chatbot</td>
    </tr>
  </table>
  ${
    summary
      ? `<div style="padding:16px;background:rgba(124,58,237,0.1);border-radius:12px;border:1px solid rgba(124,58,237,0.2);margin-bottom:20px;">
    <p style="color:#9d8fd4;font-size:13px;margin:0 0 8px 0;font-weight:600;">Conversation Summary:</p>
    <pre style="color:#e2d9f3;font-size:12px;line-height:1.7;white-space:pre-wrap;margin:0;font-family:Arial,sans-serif;">${summary}</pre>
  </div>`
      : ""
  }
  ${
    email
      ? `<div style="text-align:center;margin-bottom:20px;">
    <a href="mailto:${email}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:14px;">Reply to ${name || "Lead"} →</a>
  </div>`
      : ""
  }
  <p style="text-align:center;color:#3d2f60;font-size:12px;margin:0;">PurpleSoftHub — purplesofthub.netlify.app</p>
</div>`,
        });
      } catch (emailError) {
        console.error("Lead email notification failed:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat lead API error:", error);
    return NextResponse.json(
      { error: "Failed to save lead." },
      { status: 500 }
    );
  }
}
