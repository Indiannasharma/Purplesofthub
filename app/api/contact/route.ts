import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import Contact from "@/lib/models/Contact";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, service, message } = body;

    // ── Validation ──────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

    // ── Nodemailer Transport ─────────────────────────────
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ── Notification to PurpleSoftHub team ──────────────
    await transporter.sendMail({
      from: `"PurpleSoftHub Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `🚀 New Project Inquiry from ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#a855f7;font-size:24px;margin:0;">💜 New Inquiry — PurpleSoftHub</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;color:#9d8fd4;font-size:14px;width:100px;">Name</td><td style="padding:10px 0;color:#fff;font-weight:600;">${name}</td></tr>
            <tr><td style="padding:10px 0;color:#9d8fd4;font-size:14px;">Email</td><td style="padding:10px 0;color:#fff;">${email}</td></tr>
            <tr><td style="padding:10px 0;color:#9d8fd4;font-size:14px;">Service</td><td style="padding:10px 0;color:#a855f7;font-weight:600;">${service || "Not specified"}</td></tr>
          </table>
          <div style="margin-top:24px;padding:20px;background:rgba(124,58,237,0.1);border-radius:12px;border:1px solid rgba(124,58,237,0.2);">
            <p style="color:#9d8fd4;font-size:13px;margin-bottom:8px;">Message:</p>
            <p style="color:#e2d9f3;line-height:1.7;">${message}</p>
          </div>
          <div style="margin-top:24px;text-align:center;">
            <a href="mailto:${email}" style="background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;">Reply to ${name}</a>
          </div>
          <p style="text-align:center;color:#3d2f60;font-size:12px;margin-top:24px;">PurpleSoftHub — purplesofthub.com</p>
        </div>
      `,
    });

    // ── Auto-reply to client ─────────────────────────────
    await transporter.sendMail({
      from: `"PurpleSoftHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message — PurpleSoftHub 💜",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
          <h1 style="color:#a855f7;font-size:22px;margin-bottom:16px;">Hi ${name}! 👋</h1>
          <p style="color:#b8a9d9;line-height:1.8;margin-bottom:16px;">
            Thank you for reaching out to <strong style="color:#a855f7;">PurpleSoftHub</strong>. We've received your message and our team will get back to you within <strong style="color:#fff;">24 hours</strong>.
          </p>
          ${service ? `<p style="color:#b8a9d9;margin-bottom:16px;">Service requested: <strong style="color:#a855f7;">${service}</strong></p>` : ""}
          <div style="padding:20px;background:rgba(124,58,237,0.1);border-radius:12px;border:1px solid rgba(124,58,237,0.2);margin:24px 0;">
            <p style="color:#9d8fd4;font-size:13px;margin-bottom:8px;">Your message:</p>
            <p style="color:#e2d9f3;line-height:1.7;">${message}</p>
          </div>
          <p style="color:#9d8fd4;line-height:1.8;">
            While you wait, feel free to explore our services at <a href="https://purplesofthub.com" style="color:#a855f7;">purplesofthub.com</a>
          </p>
          <p style="color:#b8a9d9;margin-top:24px;">With 💜,<br/><strong style="color:#fff;">The PurpleSoftHub Team</strong></p>
          <p style="text-align:center;color:#3d2f60;font-size:12px;margin-top:28px;">© 2026 PurpleSoftHub. All rights reserved.</p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully!" },
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
