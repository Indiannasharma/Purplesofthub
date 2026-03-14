import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongodb";
import ChatLead from "@/lib/models/ChatLead";

export async function POST(req: NextRequest) {
  try {
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const EMAIL_TO = process.env.EMAIL_TO;

    const body = await req.json();
    const { name, email, summary, handoffMethod } = body as {
      name?: string;
      email?: string;
      summary?: string;
      handoffMethod?: string;
    };

    // Save to MongoDB
    await connectDB();
    await ChatLead.create({
      name: name?.trim() || "",
      email: email?.trim().toLowerCase() || "",
      summary: summary?.trim() || "",
      handoffMethod: handoffMethod || "none",
      source: "chatbot",
      status: "new",
    });

    // Send notification email (non-blocking failure)
    if (EMAIL_USER && EMAIL_PASS && EMAIL_TO) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"PurpleSoftHub Chatbot" <${EMAIL_USER}>`,
          to: EMAIL_TO,
          subject: `💬 New Chat Lead — ${name || "Unknown Visitor"}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#06030f;color:#e2d9f3;padding:32px;border-radius:16px;border:1px solid rgba(124,58,237,0.3);">
              <h1 style="color:#a855f7;font-size:22px;margin-bottom:24px;">💬 New Chat Lead — PurpleSoftHub</h1>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#9d8fd4;font-size:14px;width:120px;">Name</td><td style="padding:8px 0;color:#fff;font-weight:600;">${name || "Not provided"}</td></tr>
                <tr><td style="padding:8px 0;color:#9d8fd4;font-size:14px;">Email</td><td style="padding:8px 0;color:#a855f7;">${email || "Not provided"}</td></tr>
                <tr><td style="padding:8px 0;color:#9d8fd4;font-size:14px;">Handoff via</td><td style="padding:8px 0;color:#c084fc;font-weight:600;">${handoffMethod || "none"}</td></tr>
                <tr><td style="padding:8px 0;color:#9d8fd4;font-size:14px;">Source</td><td style="padding:8px 0;color:#fff;">Puri Chatbot</td></tr>
              </table>
              ${summary ? `
              <div style="margin-top:20px;padding:16px;background:rgba(124,58,237,0.1);border-radius:12px;border:1px solid rgba(124,58,237,0.2);">
                <p style="color:#9d8fd4;font-size:13px;margin-bottom:8px;">Conversation Summary:</p>
                <p style="color:#e2d9f3;line-height:1.7;">${summary}</p>
              </div>` : ""}
              <p style="text-align:center;color:#3d2f60;font-size:12px;margin-top:24px;">PurpleSoftHub — purplesofthub.com</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Lead email notification failed:", emailError);
        // Don't fail the request if email fails
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
