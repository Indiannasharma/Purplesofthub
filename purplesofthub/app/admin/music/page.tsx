"use client";

import { useEffect, useState } from "react";
import { Music4 } from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { overviewDate } from "@/lib/customer-overview";
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

export default function AdminMusic() {
  const [campaigns, setCampaigns] = useState<MusicCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
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

      } catch { setError("Could not read music submissions. Refresh to try again."); } finally { setLoading(false); }
    };

    loadCampaigns();
  }, []);

  return <AdminPage className="cc-module">
    <AdminPageHeader title="Music" description="Review artist submissions for distribution and promotion." />
    {loading ? <AdminLoadingState /> : error ? <AdminErrorState title="Could not load music submissions" description={error} /> : campaigns.length === 0 ? <AdminEmptyState title="No music submissions yet" description="Artist submissions will appear here when they are received." icon={Music4} /> : <>
      <p className="admin-contract-note">{campaigns.length} loaded submissions · Campaign details reflect submitted information.</p>
      <ul className="admin-record-list">{campaigns.map(campaign => <li key={campaign.id}><article className="admin-record-card">
        <header><div><h2>{campaign.track_title}</h2><p>{campaign.artist_name}{campaign.genre ? ' · '+campaign.genre : ''}</p><p>{campaign.plan_name || 'Music campaign'}{campaign.campaign_goal ? ' · '+campaign.campaign_goal : ''}</p></div><AdminStatusBadge status={campaign.status.replace(/_/g, ' ')} /></header>
        <dl><Info label="Submitted" value={overviewDate(campaign.created_at)} /><Info label="Email" value={campaign.contact_email} /><Info label="Phone" value={campaign.contact_phone} /><Info label="Budget" value={campaign.budget_range} /><Info label="Track URL" value={campaign.track_url || campaign.spotify_url || campaign.apple_url} link /><Info label="Plan type" value={campaign.plan_type} /></dl>
        {campaign.platforms?.length ? <p style={{marginTop:16}}>Platforms: {campaign.platforms.join(', ')}</p> : null}
        {campaign.description ? <p className="admin-record-note">{campaign.description}</p> : null}
      </article></li>)}</ul>
    </>}
  </AdminPage>;
}
function Info({ label, value, link = false }: { label: string; value?: string | null; link?: boolean }) {
  return <div><dt>{label}</dt><dd>{value ? link ? <a href={value} target="_blank" rel="noreferrer" className="cc-link">{value}</a> : value : 'Not provided'}</dd></div>;
}
