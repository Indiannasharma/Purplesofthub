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
    <div className="w-full min-w-0">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="m-0 text-[22px] font-black leading-tight text-[var(--cmd-heading)] sm:text-2xl">
            🎵 Music Dashboard
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--cmd-body)]">
            Submit artist, release, distribution, and promotion campaign data.
          </p>
        </div>
        <div className="w-full sm:w-auto sm:shrink-0">
          <CurrencySwitcher compact dropdownAlign="left" />
        </div>
      </div>

      <div className="space-y-8">
        {planGroups.map((group) => (
          <section key={group.type} className="min-w-0">
            <div className="mb-4">
              <h2 className="m-0 text-lg font-black text-[var(--cmd-heading)]">{group.title}</h2>
              <p className="mt-1 max-w-3xl text-[13px] leading-6 text-[var(--cmd-body)]">{group.desc}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 min-[720px]:grid-cols-2 xl:grid-cols-3">
              {group.service.plans.filter((plan) => !plan.isCustom).map((plan) => (
                <article
                  key={plan.id}
                  className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-brand-500/15 bg-[var(--cmd-card)] p-4 shadow-sm shadow-brand-950/5 sm:p-5"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 ${
                      group.type === "distribution"
                        ? "bg-gradient-to-r from-cyan-500 to-brand-600"
                        : "bg-gradient-to-r from-brand-600 to-pink-500"
                    }`}
                  />

                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-2xl">
                      {PLAN_ICONS[plan.id] || "🎵"}
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase text-brand-500">
                        {group.type}
                      </span>
                      <h3 className="mt-2 text-base font-extrabold leading-snug text-[var(--cmd-heading)]">
                        {plan.name}
                      </h3>
                    </div>
                  </div>

                  <p className="mb-4 flex-1 text-[13px] leading-6 text-[var(--cmd-body)]">{plan.description}</p>

                  <div className="mb-5 grid gap-2 rounded-lg border border-brand-500/10 bg-brand-500/[0.04] p-3 text-xs min-[420px]:grid-cols-2">
                    <span className="font-semibold text-[var(--cmd-muted)]">{plan.delivery}</span>
                    <span className="font-black text-brand-500 min-[420px]:text-right">
                      {formatRegionalPrice(plan.priceNGN, plan.priceUSD, currency)}
                    </span>
                  </div>

                  <div className="grid gap-2">
                    <button
                      onClick={() => openSubmitForm(plan, group.type)}
                      className="min-h-11 w-full rounded-lg border-0 bg-gradient-to-br from-brand-600 to-brand-400 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand-600/20 transition hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-brand-500/20"
                    >
                      Submit Artist Data →
                    </button>
                    <button
                      onClick={() => setCheckout({ service: group.service, plan })}
                      className="min-h-11 w-full rounded-lg border border-brand-500/30 bg-transparent px-4 py-3 text-[13px] font-extrabold text-brand-500 transition hover:bg-brand-500/10 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
                    >
                      Pay / Checkout →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {campaigns.length > 0 ? (
        <section className="mt-9">
          <h2 className="mb-4 text-lg font-extrabold text-[var(--cmd-heading)]">My Music Campaigns</h2>
          <div className="flex flex-col gap-3">
            {campaigns.map((campaign) => {
              const s = STATUS_STYLES[campaign.status] || STATUS_STYLES.pending;

              return (
                <article
                  key={campaign.id}
                  className="flex min-w-0 flex-col gap-4 rounded-xl border border-brand-500/15 bg-[var(--cmd-card)] p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5"
                >
                  <div className="min-w-0">
                    <h5 className="m-0 break-words text-[15px] font-extrabold text-[var(--cmd-heading)]">
                      {campaign.track_title}
                    </h5>
                    <p className="mt-1 text-[13px] text-[var(--cmd-muted)]">
                      {campaign.artist_name} · {campaign.plan_name || "Music campaign"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(campaign.platforms || []).slice(0, 4).map((platform) => (
                        <span
                          key={platform}
                          className="rounded-full border border-brand-500/20 bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-500"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-right">
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold capitalize"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {campaign.status.replace(/_/g, " ")}
                    </span>
                    <p className="m-0 text-[11px] text-[var(--cmd-muted)] sm:mt-2">
                      {format(new Date(campaign.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-brand-500/25 bg-brand-500/[0.04] px-4 py-8 text-center sm:px-8">
          <p className="m-0 text-sm leading-6 text-[var(--cmd-muted)]">
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
