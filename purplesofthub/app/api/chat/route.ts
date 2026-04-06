import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getClientIp, checkRateLimit, rateLimiters } from "@/lib/rateLimit";
import { redis } from "@/lib/redis";
import { verifyCaptcha } from "@/lib/verifyCaptcha";

const SYSTEM_PROMPT = `You are Puri, the friendly AI assistant for PurpleSoftHub — a digital innovation studio based in Nigeria serving clients worldwide.

Personality:
- Friendly, warm and conversational
- Enthusiastic about tech and creativity
- Professional but never stiff
- Use occasional emojis 💜
- Keep responses 2-4 sentences max
- Talk naturally, never use bullet points
- Always end with a helpful next step

Your job:
1. Answer questions about PurpleSoftHub services
2. Recommend the right service for each visitor
3. Collect name, email and project details
4. Guide them to book a discovery call
5. Hand off to WhatsApp when requested

Services & Starting Prices:
- Web Development (Next.js, React, e-commerce, SaaS platforms, business websites) from $300
- Mobile App Development (Flutter, React Native, iOS & Android) from $800
- Digital Marketing (Meta Ads, Google Ads, TikTok Ads, Snapchat Ads, SEO) from $150/month
- UI/UX Design (Figma, app design, product design) from $200
- SaaS Development (AI tools, automation, dashboards, creator tools) from $1,000
- Music Distribution & Promotion (150+ platforms, Spotify, Apple Music, social media campaigns, artist branding) from $100

Process: Discovery → Design → Development → Launch & Support

Contact: hello@purplesofthub.com
Website: purplesofthub.com
Social: @purplesofthub on all platforms

Lead collection flow:
- When someone shows interest in a service, naturally ask for their name first
- Then ask for their email address
- Then ask what they want to build
- End with: "Awesome! I'll make sure a Dev reaches out to you within 24 hours 💜 You can also book a call directly at purplesofthub.com/contact"

Human handoff — show WhatsApp button when:
- User says: "talk to human", "real person", "speak to someone", "talk to a Dev", "call me", "urgent", "asap", "frustrated", "live agent", "escalate", "whatsapp"
- User asks the same question twice
- Query is too complex or sensitive

When handoff triggered say exactly:
"Of course! Our Team would love to help you personally 💜 Tap below to start a WhatsApp conversation with him right now — he typically replies within minutes!"
Then set showHandoff: true

Pricing: always clarify these are starting prices. Final quote depends on project scope. Encourage the free discovery call always.

If you don't know something:
"Great question! Let me connect you directly with the team for that one 💜" → show handoff`;

const HANDOFF_KEYWORDS = [
  "human",
  "real person",
  "emmanuel",
  "talk to",
  "speak to",
  "call",
  "urgent",
  "asap",
  "frustrated",
  "whatsapp",
  "live agent",
  "escalate",
];

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rl = await checkRateLimit(rateLimiters.chat, ip);
    if (!rl.ok) {
      const retryAfterSec = Math.ceil((rl.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { reply: "Too many requests. Please try again later.", showHandoff: false, shouldSaveLead: false, retryAfterSec },
        { status: 429, headers: { "Retry-After": retryAfterSec.toString() } }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const messages = Array.isArray(body.messages) ? body.messages as { role: "user" | "assistant"; content: string }[] : null;
    const leadData = body.leadData as { name?: string; email?: string } | undefined;
    const captchaToken = typeof body.captchaToken === "string" ? body.captchaToken : undefined;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;

    const captcha = await verifyCaptcha(captchaToken, ip);
    if (!captcha.ok) {
      return NextResponse.json(
        { reply: captcha.error || "Captcha verification failed.", showHandoff: false, shouldSaveLead: false },
        { status: 400 }
      );
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Use Redis-stored history when sessionId is provided
    type ChatMessage = { role: "user" | "assistant"; content: string }
    let trimmed: ChatMessage[]
    if (sessionId && redis) {
      const stored = await redis.lrange<ChatMessage>(`chat:${sessionId}`, 0, 49)
      const latest = messages[messages.length - 1]
      trimmed = stored.length > 0 ? [...stored, latest] : messages.slice(-50)
    } else {
      trimmed = messages.slice(-50)
    }
    const latestMessage = trimmed[trimmed.length - 1]?.content ?? "";

    const showHandoff = HANDOFF_KEYWORDS.some((k) =>
      latestMessage.toLowerCase().includes(k)
    );

    const combined = trimmed.map((m) => m.content).join(" ");
    const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(combined);
    const hasName =
      (leadData?.name != null && leadData.name.length > 0) ||
      /(?:my name is|i'm|i am|call me)\s+[A-Za-z]/i.test(combined);
    const shouldSaveLead = hasEmail && hasName;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: trimmed,
    });

    const reply =
      response.content[0].type === "text"
        ? response.content[0].text
        : "I'm having trouble responding right now. Please try again! 💜";

    // Persist conversation to Redis (TTL: 1 hour)
    if (sessionId && redis) {
      try {
        const userMsg = trimmed[trimmed.length - 1]
        const pipe = redis.pipeline()
        pipe.rpush(`chat:${sessionId}`, userMsg, { role: "assistant" as const, content: reply })
        pipe.expire(`chat:${sessionId}`, 3600)
        await pipe.exec()
      } catch (redisError) {
        console.error("Redis pipeline error — session history not persisted:", redisError)
      }
    }

    return NextResponse.json({ reply, showHandoff, shouldSaveLead });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        reply: "Something went wrong. Please try again! 💜",
        showHandoff: false,
        shouldSaveLead: false,
      },
      { status: 500 }
    );
  }
}
