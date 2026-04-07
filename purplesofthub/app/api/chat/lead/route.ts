import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { getClientIp, checkRateLimit, rateLimiters } from "@/lib/rateLimit";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = await checkRateLimit(rateLimiters.chatLead, ip);
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
      name?: string; email?: string; summary?: string; handoffTriggered?: boolean;
    };

    const supabase = await createClient();
    await supabase.from("chat_leads").insert({
      name: name?.trim() ?? "",
      email: email?.trim().toLowerCase() ?? "",
      message: summary?.trim() ?? "",
      status: "new",
    });

    if (EMAIL_USER && EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });
        const safeName = escapeHtml(name || "");
        const safeEmail = escapeHtml(email || "");
        const safeSummary = escapeHtml(summary || "");

        await transporter.sendMail({
          from: `"PurpleSoftHub Chatbot" <${EMAIL_USER}>`,
          to: process.env.EMAIL_TO || "hello@purplesofthub.com",
          replyTo: email || EMAIL_USER,
          subject: `💬 New Chat Lead — ${safeName || "Unknown Visitor"}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
            <h1 style="color:#a855f7;font-size:22px;">💬 New Chat Lead</h1>
            <p><strong style="color:#9d8fd4;">Name:</strong> ${safeName || "Not provided"}</p>
            <p><strong style="color:#9d8fd4;">Email:</strong> <a href="mailto:${safeEmail}" style="color:#a855f7;">${safeEmail || "Not provided"}</a></p>
            <p><strong style="color:#9d8fd4;">WhatsApp Handoff:</strong> ${handoffTriggered ? "✅ Yes" : "No"}</p>
            ${safeSummary ? `<div style="padding:16px;background:rgba(124,58,237,0.1);border-radius:12px;margin-top:16px;"><pre style="white-space:pre-wrap;margin:0;color:#e2d9f3;">${safeSummary}</pre></div>` : ""}
          </div>`,
        });
      } catch (emailError) {
        console.error("Lead email notification failed:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chat lead API error:", error);
    return NextResponse.json({ error: "Failed to save lead." }, { status: 500 });
  }
}
