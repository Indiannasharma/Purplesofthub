"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";

type MusicCampaign = {
  id: string;
  created_at: string;
  track_title: string;
  artist_name: string;
  genre?: string | null;
  status: string;
  platforms?: string[] | null;
  plan_name?: string | null;
  plan_type?: string | null;
  campaign_goal?: string | null;
  budget_range?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  spotify_url?: string | null;
  apple_url?: string | null;
  track_url?: string | null;
  description?: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  rejected: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AdminMusic() {
  const [campaigns, setCampaigns] = useState<MusicCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCampaigns = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("music_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setCampaigns(data || []);
      }

      setLoading(false);
    };

    loadCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-black dark:text-white">Music Campaigns</h1>
            <p className="text-sm text-bodydark2">
              Review artist submissions for distribution and promotion campaigns.
            </p>
          </div>
          <span className="w-fit rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-500">
            {campaigns.length} submissions
          </span>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-stroke bg-white p-8 text-center dark:border-strokedark dark:bg-boxdark">
          <p className="text-sm text-bodydark2">Loading music submissions...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stroke bg-white p-8 text-center dark:border-strokedark dark:bg-boxdark">
          <p className="text-sm text-bodydark2">No music submissions yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const statusClass = STATUS_STYLES[campaign.status] || STATUS_STYLES.pending;
            return (
              <article
                key={campaign.id}
                className="rounded-xl border border-stroke bg-white p-5 shadow-sm dark:border-strokedark dark:bg-boxdark"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusClass}`}>
                        {campaign.status.replace(/_/g, " ")}
                      </span>
                      {campaign.plan_type ? (
                        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold capitalize text-cyan-500">
                          {campaign.plan_type}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-lg font-black text-black dark:text-white">
                      {campaign.track_title}
                    </h2>
                    <p className="mt-1 text-sm text-bodydark2">
                      {campaign.artist_name}
                      {campaign.genre ? ` · ${campaign.genre}` : ""}
                    </p>
                    <p className="mt-2 text-sm text-bodydark2">
                      {campaign.plan_name || "Music campaign"}
                      {campaign.campaign_goal ? ` · ${campaign.campaign_goal}` : ""}
                    </p>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-bodydark2">Submitted</p>
                    <p className="mt-1 text-sm font-semibold text-black dark:text-white">
                      {format(new Date(campaign.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Info label="Email" value={campaign.contact_email} />
                  <Info label="Phone" value={campaign.contact_phone} />
                  <Info label="Budget" value={campaign.budget_range} />
                  <Info label="Track URL" value={campaign.track_url || campaign.spotify_url || campaign.apple_url} link />
                </div>

                {campaign.platforms?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {campaign.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-500"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                ) : null}

                {campaign.description ? (
                  <p className="mt-4 rounded-lg border border-stroke bg-gray-50 p-3 text-sm leading-6 text-bodydark2 dark:border-strokedark dark:bg-boxdark-2">
                    {campaign.description}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, link = false }: { label: string; value?: string | null; link?: boolean }) {
  return (
    <div className="rounded-lg border border-stroke bg-gray-50 p-3 dark:border-strokedark dark:bg-boxdark-2">
      <p className="text-[11px] font-bold uppercase tracking-wide text-bodydark2">{label}</p>
      {value ? (
        link ? (
          <a href={value} target="_blank" rel="noreferrer" className="mt-1 block truncate text-sm font-semibold text-purple-500">
            {value}
          </a>
        ) : (
          <p className="mt-1 truncate text-sm font-semibold text-black dark:text-white">{value}</p>
        )
      ) : (
        <p className="mt-1 text-sm text-bodydark2">Not provided</p>
      )}
    </div>
  );
}
