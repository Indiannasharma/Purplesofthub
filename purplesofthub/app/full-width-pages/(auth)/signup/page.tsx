import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — PurpleSoftHub",
  description: "Create your PurpleSoftHub account and join our community of digital innovators.",
};

export default function SignUp() {
  return <SignUpForm />;
}
