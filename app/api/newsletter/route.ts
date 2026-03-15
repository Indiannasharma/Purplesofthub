import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/lib/models/Subscriber";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/verifyCaptcha";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = rateLimit(`newsletter:${ip}`, { windowMs: 10 * 60 * 1000, max: 5 });
    if (!rl.ok) {
      const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many requests. Please try again later.", retryAfterSec },
        { status: 429, headers: { "Retry-After": retryAfterSec.toString() } }
      );
    }

    const { email, captchaToken } = await req.json();

    const captcha = await verifyTurnstile(captchaToken, ip);
    if (!captcha.ok) {
      return NextResponse.json(
        { error: captcha.error || "Captcha verification failed." },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    await connectDB();

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "You're already subscribed! 💜" }, { status: 409 });
    }

    await Subscriber.create({ email: email.toLowerCase(), status: "active" });

    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;

    if (EMAIL_USER && EMAIL_PASS) {
      try {
    // Welcome email
        const transporter = nodemailer.createTransport({
          service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });
    
        await transporter.sendMail({
        from: `"PurpleSoftHub" <${EMAIL_USER}>`,
          to: email,
          subject: "Welcome to PurpleSoftHub 💜",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:40px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
              <div style="text-align:center;margin-bottom:32px;">
                <h1 style="color:#a855f7;font-size:28px;margin:0;">Welcome to PurpleSoftHub 💜</h1>
              </div>
              <p style="color:#b8a9d9;line-height:1.8;margin-bottom:20px;font-size:16px;">
                You're officially part of the PurpleSoftHub community! 🎉
              </p>
              <p style="color:#b8a9d9;line-height:1.8;margin-bottom:20px;">
                You'll be the first to receive:
              </p>
              <ul style="color:#b8a9d9;line-height:2;padding-left:20px;margin-bottom:28px;">
                <li>💡 Tech insights &amp; tutorials</li>
                <li>🚀 Product launches &amp; updates</li>
                <li>📈 Digital marketing tips</li>
                <li>🎵 Music industry guides</li>
                <li>🎁 Exclusive offers for subscribers</li>
              </ul>
              <div style="text-align:center;margin:32px 0;">
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://purplesofthub.com"}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;">Visit Our Website →</a>
              </div>
              <p style="color:#b8a9d9;line-height:1.8;">With 💜,<br/><strong style="color:#fff;">The PurpleSoftHub Team</strong></p>
              <p style="text-align:center;color:#3d2f60;font-size:12px;margin-top:28px;">© 2026 PurpleSoftHub. All rights reserved.</p>
            </div>
          `,
        });
    
      } catch (emailError) {
        console.error("Newsletter email error:", emailError);
      }
    }
    return NextResponse.json({ success: true, message: "You've been subscribed!" }, { status: 200 });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
