import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getClientIp, checkRateLimit, rateLimiters } from "@/lib/rateLimit";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 200;
const MAX_SUMMARY_LENGTH = 4000;

/**
 * Trusted server-side Supabase client (bypasses RLS).
 *
 * This endpoint is intentionally public: the chat widget has no session.
 * chat_leads has no INSERT policy for anon/authenticated roles, so the only
 * sanctioned write path is this server route using the service role key.
 * The key is read server-side only and never sent to the browser.
 */
function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createServiceClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

/** Trim + length-cap an untrusted string field. */
function sanitizeField(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
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

    const body = (await req.json().catch(() => null)) as {
      name?: unknown; email?: unknown; summary?: unknown; handoffTriggered?: unknown;
    } | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const name = sanitizeField(body.name, MAX_NAME_LENGTH);
    const email = sanitizeField(body.email, MAX_EMAIL_LENGTH).toLowerCase();
    const summary = sanitizeField(body.summary, MAX_SUMMARY_LENGTH);

    if (email && !emailPattern.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    // Reject empty, content-free submissions early.
    if (!name && !email && !summary) {
      return NextResponse.json({ error: "No lead details were provided." }, { status: 400 });
    }

    // ── Persistence: trusted server-side insert, errors are never ignored ──
    let persisted = false;
    const service = getServiceRoleClient();

    if (!service) {
      console.error(
        "[chat/lead] SUPABASE_SERVICE_ROLE_KEY is not configured — lead cannot be persisted"
      );
    } else {
      const { error: insertError } = await service.from("chat_leads").insert({
        name,
        email,
        message: summary,
        status: "new",
      });

      if (insertError) {
        console.error(
          "[chat/lead] Failed to persist lead:",
          insertError.code,
          insertError.message
        );
      } else {
        persisted = true;
      }
    }

    // ── Email notification (unchanged behaviour, best effort) ──
    if (EMAIL_USER && EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSummary = escapeHtml(summary);

        await transporter.sendMail({
          from: `"PurpleSoftHub Chatbot" <${EMAIL_USER}>`,
          to: process.env.EMAIL_TO || "hello@purplesofthub.com",
          replyTo: email || EMAIL_USER,
          subject: `💬 New Chat Lead — ${safeName || "Unknown Visitor"}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
            <h1 style="color:#a855f7;font-size:22px;">💬 New Chat Lead</h1>
            <p><strong style="color:#9d8fd4;">Name:</strong> ${safeName || "Not provided"}</p>
            <p><strong style="color:#9d8fd4;">Email:</strong> <a href="mailto:${safeEmail}" style="color:#a855f7;">${safeEmail || "Not provided"}</a></p>
            <p><strong style="color:#9d8fd4;">WhatsApp Handoff:</strong> ${body.handoffTriggered === true ? "✅ Yes" : "No"}</p>
            ${safeSummary ? `<div style="padding:16px;background:rgba(124,58,237,0.1);border-radius:12px;margin-top:16px;"><pre style="white-space:pre-wrap;margin:0;color:#e2d9f3;">${safeSummary}</pre></div>` : ""}
          </div>`,
        });
      } catch (emailError) {
        console.error("[chat/lead] Lead email notification failed:", emailError);
      }
    }

    // Never claim success when the lead was not persisted.
    if (!persisted) {
      return NextResponse.json(
        { error: "We could not save your details. Please try again or email us directly." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[chat/lead] Chat lead API error:", error);
    return NextResponse.json({ error: "Failed to save lead." }, { status: 500 });
  }
}