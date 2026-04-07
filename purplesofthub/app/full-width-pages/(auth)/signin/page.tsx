import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — PurpleSoftHub",
  description: "Sign in to your PurpleSoftHub account and access premium digital solutions.",
};

export default function SignIn() {
  return <SignInForm />;
}
