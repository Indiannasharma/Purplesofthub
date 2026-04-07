import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative', padding: '24px', background: 'var(--cyber-bg)', zIndex: 1 }} className="sm:p-0">
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'row', width: '100%', height: '100vh', justifyContent: 'center', background: 'var(--cyber-bg)' }} className="flex-col sm:p-0 lg:flex-row">
        {children}
        <div style={{
          width: '50%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(168,85,247,0.05))',
          border: '1px solid var(--cyber-border)',
          display: 'grid',
          alignItems: 'center',
        }} className="hidden lg:grid">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '280px' }}>
              <Link href="/" style={{ display: 'block', marginBottom: '16px' }}>
                <Image
                  width={231}
                  height={48}
                  src="./images/logo/auth-logo.svg"
                  alt="Logo"
                />
              </Link>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                Experience premium digital solutions with cyberpunk aesthetics
              </p>
            </div>
          </div>
        </div>
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }} className="hidden sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
