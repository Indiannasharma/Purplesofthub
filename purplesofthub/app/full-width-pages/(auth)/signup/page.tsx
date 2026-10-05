import AuthPage from "@/app/sign-up/page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign Up — PurpleSoftHub" };

// Retained URL, shared working controller; no duplicate authentication implementation.
export default function Page() { return <AuthPage />; }
