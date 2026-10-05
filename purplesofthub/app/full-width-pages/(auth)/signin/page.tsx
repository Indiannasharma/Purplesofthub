import AuthPage from "@/app/sign-in/page";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In — PurpleSoftHub" };

// Retained URL, shared working controller; no duplicate authentication implementation.
export default function Page() { return <AuthPage />; }
