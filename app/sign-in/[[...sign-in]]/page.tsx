import { SignIn } from "@clerk/nextjs";
import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <div className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Back to website
            </Link>
            <h1 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Sign in to access your dashboard.
            </p>
            <div className="mt-8">
              <SignIn
                forceRedirectUrl="/dashboard"
                appearance={{
                  variables: {
                    colorPrimary: "#7c3aed",
                    fontFamily: "Outfit, sans-serif",
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative hidden w-1/2 items-center justify-center bg-brand-950 dark:bg-white/5 lg:flex">
          <GridShape />
          <div className="relative z-10 flex max-w-xs flex-col items-center text-center">
            <Image
              width={230}
              height={48}
              src="/images/logo/auth-logo.svg"
              alt="PurpleSoftHub"
            />
            <p className="mt-4 text-sm text-gray-300">
              Welcome to PurpleSoftHub Client Portal.
            </p>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
