import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are Puri, the friendly AI assistant for PurpleSoftHub — a digital innovation studio based in Nigeria serving clients worldwide.

Personality:
- Friendly, warm and conversational
- Enthusiastic about tech and creativity
- Professional but never stiff
- Use occasional emojis 💜
- Keep responses 2-4 sentences max
- Talk naturally, never use bullet points

Your job:
1. Answer questions about PurpleSoftHub services
2. Recommend the right service for each visitor
3. Collect name, email and project details
4. Guide them to book a discovery call
5. Hand off to human when requested or needed

Services & Pricing:
- Web Development (Next.js, React, e-commerce, SaaS, business websites) from $300
- Mobile App Development (Flutter, React Native, iOS & Android) from $800
- Digital Marketing (Meta, Google, TikTok Ads, SEO) from $150/month
- UI/UX Design (Figma, app & product design) from $200
- SaaS Development (AI tools, automation, dashboards) from $1,000
- Music Distribution & Promotion (150+ platforms, Spotify, Apple Music, social campaigns, artist branding) from $100

Process: Discovery → Design → Development → Launch & Support

Contact: purplesofthub@gmail.com
Website: purplesofthub.netlify.app
Social: @purplesofthub everywhere

Lead collection:
- Ask for name first naturally
- Then email
- Then project details
- End: "I'll get Emmanuel to reach out within 24 hours! Or book directly at purplesofthub.netlify.app/contact 💜"

Human handoff triggers — set showHandoff:true when user says any of:
"talk to human", "real person", "speak to someone", "talk to Indianna", "call", "urgent", "ASAP", "frustrated", "live agent", "escalate"
OR user repeats same question twice
OR query is too complex

When triggering handoff say:
"Of course! Let me connect you with Emmanuel right away 💜 Here's how you can reach him:"

Pricing: always clarify these are starting prices — final quote depends on scope. Encourage free discovery call.

Never make up information. If unsure: "Let me connect you with the team!" → /contact`;

const HANDOFF_KEYWORDS = [
  "talk to human", "real person", "speak to someone", "talk to indianna",
  "talk to emmanuel", "call", "urgent", "asap", "frustrated", "live agent",
  "escalate", "human agent", "real agent", "speak to a person",
];

function detectHandoff(message: string): boolean {
  const lower = message.toLowerCase();
  return HANDOFF_KEYWORDS.some((kw) => lower.includes(kw));
}

function detectLeadComplete(
  messages: { role: string; content: string }[],
  leadData?: { name?: string; email?: string }
): boolean {
  if (leadData?.name && leadData?.email) return true;
  const combined = messages.map((m) => m.content).join(" ").toLowerCase();
  const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  const hasEmail = emailRegex.test(combined);
  const hasName = combined.includes("my name is") || combined.includes("i'm ") || combined.includes("i am ");
  return hasEmail && hasName;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI service not configured." }, { status: 503 });
    }

    const body = await req.json();
    const { messages, leadData } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      leadData?: { name?: string; email?: string };
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required." }, { status: 400 });
    }

    // Cap session length
    const trimmed = messages.slice(-50);
    const latestMessage = trimmed[trimmed.length - 1]?.content || "";

    const showHandoff = detectHandoff(latestMessage);
    const shouldSaveLead = detectLeadComplete(trimmed, leadData);

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

    return NextResponse.json({ reply, showHandoff, shouldSaveLead });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
