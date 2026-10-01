import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facebook & Instagram Account Recovery — PurpleSoftHub",
  description:
    "Professional social media account recovery support for clients worldwide. Recover hacked or disabled Facebook, Instagram and TikTok accounts. 14-30 business days.",
  keywords: [
    "social media account recovery",
    "account recovery Africa",
    "hacked account recovery Nigeria",
    "Facebook account recovery Africa",
    "Instagram account recovery Nigeria",
    "TikTok account recovery Africa",
    "disabled account recovery Nigeria",
  ],
  alternates: {
    canonical: "https://www.purplesofthub.com/services/social-media-management/account-recovery",
  },
  openGraph: {
    title: "Facebook & Instagram Account Recovery — PurpleSoftHub",
    description:
      "Professional social media account recovery support for clients worldwide. Recover hacked or disabled Facebook, Instagram and TikTok accounts. 14-30 business days.",
    url: "https://www.purplesofthub.com/services/social-media-management/account-recovery",
    siteName: "PurpleSoftHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facebook & Instagram Account Recovery — PurpleSoftHub",
    description:
      "Professional social media account recovery support for clients worldwide. Recover hacked or disabled Facebook, Instagram and TikTok accounts. 14-30 business days.",
  },
};

export default function AccountRecoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
