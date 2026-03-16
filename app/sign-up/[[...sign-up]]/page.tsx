import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import purpleLogo from '@/Assets/images/Purplesoft-logo-main.png'
import ClerkThemeFix from '@/components/ClerkThemeFix'

const clerkElements = {
  card: {
    boxShadow: '0 0 40px rgba(124,58,237,0.2)',
    border: '1px solid rgba(124,58,237,0.2)',
    backgroundColor: '#0d0820',
  },
  headerTitle: { color: '#e2d9f3' },
  headerSubtitle: { color: '#9d8fd4' },
  socialButtonsBlockButton: {
    backgroundColor: '#1a0f35',
    border: '1px solid rgba(124,58,237,0.3)',
    color: '#e2d9f3',
  },
  socialButtonsBlockButtonText: { color: '#e2d9f3' },
  dividerLine: { backgroundColor: 'rgba(124,58,237,0.2)' },
  dividerText: { color: '#9d8fd4' },
  formFieldLabel: { color: '#9d8fd4' },
  formFieldInput: {
    backgroundColor: '#1a0f35',
    borderColor: 'rgba(124,58,237,0.3)',
    color: '#e2d9f3',
  },
  formButtonPrimary: {
    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
    color: '#ffffff',
  },
  footerActionText: { color: '#9d8fd4' },
  footerActionLink: { color: '#a855f7' },
  alternativeMethodsBlockButton: {
    backgroundColor: '#1a0f35',
    border: '1px solid rgba(124,58,237,0.3)',
    color: '#e2d9f3',
  },
}

export default function SignUpPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#06030f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <ClerkThemeFix />

      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <Image
          src={purpleLogo}
          alt="PurpleSoftHub"
          width={120}
          height={40}
          style={{ objectFit: 'contain', height: 'auto' }}
          priority
        />
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#e2d9f3',
            marginTop: '1rem',
            marginBottom: '0.25rem',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          Get started 💜
        </h1>
        <p style={{ color: '#9d8fd4', fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif' }}>
          Create your PurpleSoftHub account to track your projects
        </p>
      </div>

      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#7c3aed',
            colorBackground: '#0d0820',
            colorInputBackground: '#1a0f35',
            colorInputText: '#e2d9f3',
            colorText: '#e2d9f3',
            colorTextSecondary: '#9d8fd4',
            borderRadius: '12px',
            fontFamily: 'Outfit, sans-serif',
          },
          elements: clerkElements,
        }}
      />

      <p style={{ marginTop: '1.25rem', color: '#9d8fd4', fontSize: '0.875rem', fontFamily: 'Outfit, sans-serif' }}>
        Already have an account?{' '}
        <Link href="/sign-in" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none' }}>
          Sign in →
        </Link>
      </p>
    </main>
  )
}
