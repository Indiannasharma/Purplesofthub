"use client";

import { useState } from "react";
import { AuthView } from "@/components/auth/auth-view";

// Guarded by the existing noindex preview layout; no auth client or transport.
export default function AuthPreview() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [state, setState] = useState("ready");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [feedback, setFeedback] = useState("");
  return <><div className="auth-preview-controls"><strong>Local presentation fixture · no authentication requests</strong><label>Auth screen <select value={mode} onChange={event => setMode(event.target.value as typeof mode)}><option value="signin">Sign in</option><option value="signup">Sign up</option><option value="forgot">Forgot password</option></select></label><label>Auth state <select value={state} onChange={event => setState(event.target.value)}>{["ready", "error", "loading", "google", "success"].map(value => <option key={value} value={value}>{value}</option>)}</select></label><span role="status">{feedback}</span></div><AuthView mode={mode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} fullName={fullName} setFullName={setFullName} loading={state === "loading"} googleLoading={state === "google"} success={state === "success"} error={state === "error" ? "A deliberately long provider error for layout testing: this request could not be completed. No account or session was created." : ""} onAction={() => setFeedback("Local callback received; no request sent")} onGoogle={mode === "forgot" ? undefined : () => setFeedback("Local Google callback received; no request sent")} /></>;
}
