"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { getServiceBySlug, type Service, type ServicePlan } from "@/lib/payments/service-plans";
import UniversalCheckoutModal from "@/components/checkout/UniversalCheckoutModal";
import MusicSubmitForm from "@/components/dashboard/MusicSubmitForm";
import CurrencySwitcher from "@/components/pricing/CurrencySwitcher";
import { useCurrency } from "@/context/CurrencyContext";
import { formatRegionalPrice } from "@/lib/pricing/currency";

interface MusicCampaign {
  id: string;
  track_title: string;
  artist_name: string;
  platforms: string[] | null;
  status: string;
  created_at: string;
  plan_name?: string | null;
  plan_type?: "promotion" | "distribution" | null;
}

type PlanType = "promotion" | "distribution";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgba(234,179,8,0.12)", color: "#ca8a04" },
  in_progress: { bg: "rgba(59,130,246,0.12)", color: "#3b82f6" },
  active: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  completed: { bg: "rgba(124,58,237,0.12)", color: "#a855f7" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
  rejected: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

const PLAN_ICONS: Record<string, string> = {
  "music-buzz": "🎵",
  "music-viral": "🚀",
  "music-superstar": "💎",
  "music-label": "👑",
  "dist-single": "🎧",
  "dist-album": "💿",
  "dist-artist": "⭐",
  "dist-label": "🏷️",
};

export default function ClientMusicPage() {
  const [campaigns, setCampaigns] = useState<MusicCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [checkout, setCheckout] = useState<{ service: Service; plan: ServicePlan } | null>(null);
  const [submitPlan, setSubmitPlan] = useState<ServicePlan | null>(null);
  const [submitPlanType, setSubmitPlanType] = useState<PlanType>("promotion");
  const [submitFormOpen, setSubmitFormOpen] = useState(false);
  const { currency } = useCurrency();

  const promotionService = getServiceBySlug("music-promotion");
  const distributionService = getServiceBySlug("music-distribution");

  const loadCampaigns = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("music_campaigns")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false });

    setCampaigns(data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setLoading(false);
        return;
      }

      setUser(authUser);
      setIsLoggedIn(true);
      setUserEmail(authUser.email || "");
      setUserName(authUser.user_metadata?.full_name || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("id", authUser.id)
        .single();

      if (profile?.phone) setUserPhone(profile.phone);
      if (profile?.full_name) setUserName(profile.full_name);

      await loadCampaigns(authUser.id);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!promotionService || !distributionService) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get("service");
    const planParam = params.get("plan");
    if (!serviceParam && !planParam) return;

    const targetService = serviceParam === "distribution" ? distributionService : promotionService;
    const targetType: PlanType = serviceParam === "distribution" ? "distribution" : "promotion";
    const targetPlan =
      targetService.plans.find((plan) => plan.id === planParam) ||
      targetService.plans.find((plan) => !plan.isCustom);

    if (targetPlan) {
      setSubmitPlan(targetPlan);
      setSubmitPlanType(targetType);
      setSubmitFormOpen(true);
    }
  }, [promotionService, distributionService]);

  const openSubmitForm = (plan: ServicePlan, planType: PlanType) => {
    setSubmitPlan(plan);
    setSubmitPlanType(planType);
    setSubmitFormOpen(true);
  };

  const handleFormSuccess = () => {
    setSubmitFormOpen(false);
    if (user?.id) loadCampaigns(user.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-[3px] border-brand-500/20 border-t-brand-600" />
          <p className="text-[13px] text-[var(--cmd-muted)]">Loading your music campaigns...</p>
        </div>
      </div>
    );
  }

  if (!promotionService || !distributionService) {
    return <div className="py-12 text-center text-[var(--cmd-muted)]">Music services not found</div>;
  }

  const planGroups = [
    {
      title: "Music Distribution",
      type: "distribution" as const,
      service: distributionService,
      desc: "Submit release details for singles, EPs, albums, and yearly artist plans.",
    },
    {
      title: "Music Promotion",
      type: "promotion" as const,
      service: promotionService,
      desc: "Submit campaign details for Spotify, influencer, YouTube, and Meta Ads promotion.",
    },
  ];

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 900, color: "var(--cmd-heading)", margin: "0 0 4px", lineHeight: 1.2 }}>
          🎵 Music Dashboard
        </h1>
        <p style={{ fontSize: "14px", color: "var(--cmd-body)", margin: 0, lineHeight: 1.6 }}>
          Submit artist, release, distribution, and promotion campaign data.
        </p>
        <div style={{ marginTop: "14px", width: "fit-content", maxWidth: "100%" }}>
          <CurrencySwitcher compact dropdownAlign="left" />
        </div>
      </div>

      {planGroups.map((group) => (
        <div key={group.type} style={{ marginBottom: "36px", minWidth: 0 }}>
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 900, color: "var(--cmd-heading)", margin: "0 0 4px" }}>
              {group.title}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--cmd-body)", margin: 0, lineHeight: 1.6 }}>{group.desc}</p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "16px",
            alignItems: "stretch",
          }}>
            {group.service.plans.filter((plan) => !plan.isCustom).map((plan) => (
              <article
                key={plan.id}
                style={{
                  background: "var(--cmd-card)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  borderRadius: "16px",
                  padding: "22px",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: group.type === "distribution"
                    ? "linear-gradient(90deg, #06b6d4, #7c3aed)"
                    : "linear-gradient(90deg, #7c3aed, #ec4899)",
                }} />

                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  marginBottom: "16px",
                  flexShrink: 0,
                }}>
                  {PLAN_ICONS[plan.id] || "🎵"}
                </div>

                <span style={{
                  width: "fit-content",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  fontSize: "10px",
                  fontWeight: 800,
                  background: "rgba(124,58,237,0.1)",
                  color: "#a855f7",
                  border: "1px solid rgba(124,58,237,0.2)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {group.type}
                </span>

                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--cmd-heading)", margin: "0 0 8px", lineHeight: 1.25 }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--cmd-body)", lineHeight: 1.6, margin: "0 0 16px", flex: 1 }}>
                  {plan.description}
                </p>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "var(--cmd-muted)",
                  flexWrap: "wrap",
                  minWidth: 0,
                }}>
                  <span style={{ minWidth: 0 }}>{plan.delivery}</span>
                  <span style={{ fontWeight: 800, color: "#a855f7", whiteSpace: "nowrap" }}>
                    {formatRegionalPrice(plan.priceNGN, plan.priceUSD, currency)}
                  </span>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <button
                    onClick={() => openSubmitForm(plan, group.type)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      minHeight: "44px",
                      borderRadius: "10px",
                      border: "none",
                      background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Submit Artist Data →
                  </button>
                  <button
                    onClick={() => setCheckout({ service: group.service, plan })}
                    style={{
                      width: "100%",
                      padding: "11px",
                      minHeight: "44px",
                      borderRadius: "10px",
                      border: "1px solid rgba(124,58,237,0.28)",
                      background: "transparent",
                      color: "#a855f7",
                      fontSize: "13px",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Pay / Checkout →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}

      {campaigns.length > 0 ? (
        <div style={{ marginTop: "4px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "var(--cmd-heading)", margin: "0 0 16px" }}>
            My Music Campaigns
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {campaigns.map((campaign) => {
              const s = STATUS_STYLES[campaign.status] || STATUS_STYLES.pending;

              return (
                <article
                  key={campaign.id}
                  style={{
                    background: "var(--cmd-card)",
                    border: "1px solid rgba(124,58,237,0.12)",
                    borderRadius: "14px",
                    padding: "20px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                    minWidth: 0,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h5 style={{ fontSize: "15px", fontWeight: 800, color: "var(--cmd-heading)", margin: "0 0 4px", overflowWrap: "anywhere" }}>
                      {campaign.track_title}
                    </h5>
                    <p style={{ fontSize: "13px", color: "var(--cmd-muted)", margin: "0 0 10px" }}>
                      {campaign.artist_name} · {campaign.plan_name || "Music campaign"}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {(campaign.platforms || []).slice(0, 4).map((platform) => (
                        <span key={platform} style={{
                          fontSize: "11px",
                          padding: "2px 10px",
                          borderRadius: "100px",
                          background: "rgba(124,58,237,0.1)",
                          color: "#a855f7",
                          border: "1px solid rgba(124,58,237,0.2)",
                        }}>
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "4px 12px",
                      borderRadius: "100px",
                      background: s.bg,
                      color: s.color,
                      textTransform: "capitalize",
                    }}>
                      {campaign.status.replace(/_/g, " ")}
                    </span>
                    <p style={{ fontSize: "11px", color: "var(--cmd-muted)", margin: "8px 0 0" }}>
                      {format(new Date(campaign.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: "8px",
          borderRadius: "14px",
          border: "1px dashed rgba(124,58,237,0.2)",
          background: "rgba(124,58,237,0.03)",
          padding: "32px",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "14px", color: "var(--cmd-muted)", margin: 0, lineHeight: 1.6 }}>
            No music campaigns yet. Pick a distribution or promotion plan to submit artist details.
          </p>
        </div>
      )}

      {checkout && (
        <UniversalCheckoutModal
          service={checkout.service}
          plan={checkout.plan}
          onClose={() => setCheckout(null)}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          userName={userName}
          userPhone={userPhone}
        />
      )}

      {submitFormOpen && submitPlan && (
        <MusicSubmitForm
          planName={submitPlan.name}
          planPrice={submitPlan.priceNGN}
          planPriceUSD={submitPlan.priceUSD}
          planType={submitPlanType}
          onSuccess={handleFormSuccess}
          onClose={() => setSubmitFormOpen(false)}
        />
      )}
    </div>
  );
}
