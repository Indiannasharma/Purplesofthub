"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { WorkspaceButton } from "@/components/workspace/button";
import { ThemeToggle } from "@/components/workspace/theme-toggle";
import "@/app/styles/command-center.css";
import "@/app/styles/auth.css";

export function AuthFrame({ title, description, children, showTheme = true }: { title: string; description: string; children: ReactNode; showTheme?: boolean }) {
  return <div className="auth-page cc-root cc-theme-site workspace-root">
    <header className="auth-masthead"><Link href="/" aria-label="PurpleSoftHub home" className="auth-brand"><Image src="/images/logo/purplesoft-logo-main.png" width={160} height={42} alt="PurpleSoftHub" priority /><span>Digital Innovation Studio</span></Link>{showTheme ? <ThemeToggle contentClassName="workspace-overlay cc-root cc-theme-site" /> : null}</header>
    <main className="auth-main" id="auth-main"><div className="auth-card"><header className="auth-heading"><span className="auth-eyebrow">YOUR PURPLESOFTHUB ACCOUNT</span><h1>{title}</h1><p>{description}</p></header>{children}</div></main>
    <footer className="auth-footer"><Link href="/">Back to PurpleSoftHub</Link><span>One account. Your work, together.</span></footer>
  </div>;
}

type AuthViewProps = {
  mode: "signin" | "signup" | "forgot";
  email: string; setEmail: (value: string) => void;
  password?: string; setPassword?: (value: string) => void;
  fullName?: string; setFullName?: (value: string) => void;
  loading: boolean; googleLoading?: boolean; error: string; success?: boolean;
  onAction: () => void; onGoogle?: () => void;
};

export function AuthView({ mode, email, setEmail, password = "", setPassword, fullName = "", setFullName, loading, googleLoading = false, error, success = false, onAction, onGoogle }: AuthViewProps) {
  const signup = mode === "signup", forgot = mode === "forgot";
  const title = success ? "Check your email" : forgot ? "Reset your password" : signup ? "Create your account" : "Welcome back";
  const description = success ? "Your next step is in your inbox." : forgot ? "Enter your email to receive a reset link." : signup ? "Bring your ideas and your work into one place." : "Sign in to your PurpleSoftHub account.";
  const busy = loading || googleLoading;
  const disabled = busy || !email || (!forgot && !password) || (signup && !fullName);
  const action = forgot ? "Send reset link" : signup ? "Create account" : "Sign in";
  return <AuthFrame title={title} description={description}>
    {success ? <div className="auth-confirmation" role="status"><Mail size={24} aria-hidden="true" /><p>{forgot ? "Password reset link sent to " : "We sent a confirmation link to "}<strong>{email}</strong>{forgot ? "." : ". Click it to activate your account."}</p><Link href="/sign-in"><ArrowLeft size={16} aria-hidden="true" />Back to sign in</Link></div> : <>
      {onGoogle ? <><WorkspaceButton type="button" variant="outline" className="auth-google" onClick={onGoogle} disabled={busy} aria-busy={googleLoading}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>{googleLoading ? "Connecting..." : "Continue with Google"}</WorkspaceButton><div className="auth-divider"><span>or use your email</span></div></> : null}
      <form noValidate onSubmit={event => event.preventDefault()} aria-label={action} aria-busy={busy}>
        {error ? <p role="alert" id="auth-error" className="auth-error">{error}</p> : null}
        {signup ? <div className="auth-field"><label htmlFor="auth-name">Full name</label><input id="auth-name" name="fullName" type="text" autoComplete="name" value={fullName} onChange={event => setFullName?.(event.target.value)} aria-invalid={!!error} aria-describedby={error ? "auth-error" : undefined} placeholder="Your full name" /></div> : null}
        <div className="auth-field"><label htmlFor="auth-email">{forgot ? "Email address" : "Email"}</label><input id="auth-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={event => setEmail(event.target.value)} onKeyDown={event => forgot && event.key === "Enter" && onAction()} aria-invalid={!!error} aria-describedby={error ? "auth-error" : undefined} placeholder="you@example.com" /></div>
        {!forgot ? <div className="auth-field"><div className="auth-label-row"><label htmlFor="auth-password">Password</label>{!signup ? <Link href="/forgot-password">Forgot password?</Link> : null}</div><input id="auth-password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={event => setPassword?.(event.target.value)} onKeyDown={event => event.key === "Enter" && onAction()} aria-invalid={!!error} aria-describedby={error ? "auth-error" : undefined} placeholder={signup ? "Create a password" : "Enter your password"} /></div> : null}
        <WorkspaceButton type="button" className="auth-submit" onClick={onAction} disabled={disabled} aria-busy={loading}>{loading ? forgot ? "Sending..." : signup ? "Creating account..." : "Signing in..." : <>{action}<ArrowRight size={16} aria-hidden="true" /></>}</WorkspaceButton>
        <span className="auth-live" role="status">{busy ? googleLoading ? "Connecting to Google" : `${action} in progress` : ""}</span>
      </form>
      <p className="auth-switch">{forgot ? "Remember your password?" : signup ? "Already have an account?" : "New to PurpleSoftHub?"} <Link href={signup || forgot ? "/sign-in" : "/sign-up"}>{signup || forgot ? "Sign in" : "Create an account"}</Link></p>
    </>}
  </AuthFrame>;
}
