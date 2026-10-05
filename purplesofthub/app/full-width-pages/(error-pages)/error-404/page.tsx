import type { Metadata } from "next";
import { StatusSurface } from "@/components/auth/status-surface";

export const metadata: Metadata = { title: "404 Not Found — PurpleSoftHub" };

export default function Error404() { return <StatusSurface />; }
