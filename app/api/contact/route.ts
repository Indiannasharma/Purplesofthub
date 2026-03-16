import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import Contact from "@/lib/models/Contact";
import { getClientIp, checkRateLimit, rateLimiters } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/verifyCaptcha";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = await checkRateLimit(rateLimiters.contact, ip);
    if (!rl.ok) {
      const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfterSec },
        { status: 429, headers: { "Retry-After": retryAfterSec.toString() } }
      );
    }

    const body = await req.json();
    const { name, email, service, message, captchaToken } = body;

    const captcha = await verifyTurnstile(captchaToken, ip);
    if (!captcha.ok) {
      return NextResponse.json(
        { error: captcha.error || "Captcha verification failed." },
        { status: 400 }
      );
    }

    // ── Validation ──────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }

    // ── Save to MongoDB ──────────────────────────────────
    await connectDB();
    await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      service: service?.trim() || "",
      message: message.trim(),
      status: "new",
    });

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const EMAIL_TO = process.env.EMAIL_TO;

    if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
      return NextResponse.json(
        { success: true, message: "Message received successfully!" },
        { status: 200 }
      );
    }

    // ── Nodemailer Transport ─────────────────────────────
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const safeName    = escapeHtml(name.trim());
    const safeEmail   = escapeHtml(email.trim());
    const safeService = escapeHtml(service?.trim() || "");
    const safeMessage = escapeHtml(message.trim());

    let emailSent = false;
    try {
      // ── Notification to PurpleSoftHub team ──────────────
      await transporter.sendMail({
        from: `"PurpleSoftHub Website" <${EMAIL_USER}>`,
        to: EMAIL_TO,
        subject: `🚀 New Project Inquiry from ${safeName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
            <div style="text-align:center;margin-bottom:32px;">
              <h1 style="color:#a855f7;font-size:24px;margin:0;">💜 New Inquiry — PurpleSoftHub</h1>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;color:#9d8fd4;font-size:14px;width:100px;">Name</td><td style="padding:10px 0;color:#fff;font-weight:600;">${safeName}</td></tr>
              <tr><td style="padding:10px 0;color:#9d8fd4;font-size:14px;">Email</td><td style="padding:10px 0;color:#fff;">${safeEmail}</td></tr>
              <tr><td style="padding:10px 0;color:#9d8fd4;font-size:14px;">Service</td><td style="padding:10px 0;color:#a855f7;font-weight:600;">${safeService || "Not specified"}</td></tr>
            </table>
            <div style="margin-top:24px;padding:20px;background:rgba(124,58,237,0.1);border-radius:12px;border:1px solid rgba(124,58,237,0.2);">
              <p style="color:#9d8fd4;font-size:13px;margin-bottom:8px;">Message:</p>
              <p style="color:#e2d9f3;line-height:1.7;">${safeMessage}</p>
            </div>
            <div style="margin-top:24px;text-align:center;">
              <a href="mailto:${safeEmail}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;">Reply to ${safeName}</a>
            </div>
            <p style="text-align:center;color:#3d2f60;font-size:12px;margin-top:24px;">PurpleSoftHub — purplesofthub.com</p>
          </div>
        `,
      });

      // ── Auto-reply to client ─────────────────────────────
      await transporter.sendMail({
        from: `"PurpleSoftHub" <${EMAIL_USER}>`,
        to: safeEmail,
        subject: "We received your message — PurpleSoftHub 💜",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
            <h1 style="color:#a855f7;font-size:22px;margin-bottom:16px;">Hi ${safeName}! 👋</h1>
            <p style="color:#b8a9d9;line-height:1.8;margin-bottom:16px;">
              Thank you for reaching out to <strong style="color:#a855f7;">PurpleSoftHub</strong>. We've received your message and our team will get back to you within <strong style="color:#fff;">24 hours</strong>.
            </p>
            ${safeService ? `<p style="color:#b8a9d9;margin-bottom:16px;">Service requested: <strong style="color:#a855f7;">${safeService}</strong></p>` : ""}
            <div style="padding:20px;background:rgba(124,58,237,0.1);border-radius:12px;border:1px solid rgba(124,58,237,0.2);margin:24px 0;">
              <p style="color:#9d8fd4;font-size:13px;margin-bottom:8px;">Your message:</p>
              <p style="color:#e2d9f3;line-height:1.7;">${safeMessage}</p>
            </div>
            <p style="color:#9d8fd4;line-height:1.8;">
              While you wait, feel free to explore our services at <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}" style="color:#a855f7;">purplesofthub.com</a>
            </p>
            <p style="color:#b8a9d9;margin-top:24px;">With 💜,<br/><strong style="color:#fff;">The PurpleSoftHub Team</strong></p>
            <p style="text-align:center;color:#3d2f60;font-size:12px;margin-top:28px;">© 2026 PurpleSoftHub. All rights reserved.</p>
          </div>
        `,
      });

      emailSent = true;
    } catch (emailError) {
      console.error("Contact email error:", emailError);
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully!", emailSent },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
