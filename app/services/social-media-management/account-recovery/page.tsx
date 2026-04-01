'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2, #0d65d9)',
    bg: 'rgba(24,119,242,0.08)',
    border: 'rgba(24,119,242,0.25)',
    price_ngn: 42000,
    price_usd: 30,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    bg: 'rgba(225,48,108,0.08)',
    border: 'rgba(225,48,108,0.25)',
    price_ngn: 75000,
    price_usd: 50,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#69C9D0',
    gradient: 'linear-gradient(135deg, #010101, #69C9D0)',
    bg: 'rgba(105,201,208,0.08)',
    border: 'rgba(105,201,208,0.25)',
    price_ngn: 75000,
    price_usd: 50,
  },
]

type FormState = {
  facebookHandle: string
  firstName: string
  surname: string
  email: string
  phone: string
  supportType: string
  additionalInfo: string
  idFile: File | null
  idFileName: string
  screenshotFile: File | null
  screenshotFileName: string
}

const EMPTY_FORM: FormState = {
  facebookHandle: '',
  firstName: '',
  surname: '',
  email: '',
  phone: '',
  supportType: '',
  additionalInfo: '',
  idFile: null,
  idFileName: '',
  screenshotFile: null,
  screenshotFileName: '',
}

const PLATFORM_CONFIG = {
  facebook: {
    icon: '📘',
    rgbColor: '24,119,242',
    handleLabel: 'Facebook Handle *',
    handlePlaceholder: 'yourprofilename',
    handlePrefix: 'facebook.com/' as string | null,
    supportOptions: [
      { value: 'hacked', label: '🔓 Account Hacked' },
      { value: 'disabled', label: '🚫 Disabled Account' },
    ],
  },
  instagram: {
    icon: '📸',
    rgbColor: '225,48,108',
    handleLabel: 'Instagram Handle *',
    handlePlaceholder: '@yourinstagramhandle',
    handlePrefix: null as string | null,
    supportOptions: [
      { value: 'hacked', label: '🔓 Account Hacked' },
      { value: 'disabled', label: '🚫 Disabled Account' },
      { value: 'compromised', label: '⚠️ Account Compromised' },
    ],
  },
  tiktok: {
    icon: '🎵',
    rgbColor: '105,201,208',
    handleLabel: 'TikTok Username *',
    handlePlaceholder: '@yourtiktokusername',
    handlePrefix: null as string | null,
    supportOptions: [
      { value: 'hacked', label: '🔓 Account Hacked' },
      { value: 'banned', label: '🚫 Account Banned' },
      { value: 'suspended', label: '⏸️ Account Suspended' },
    ],
  },
}

// ─── RecoveryForm ────────────────────────────────────────────────

interface RecoveryFormProps {
  platform: 'facebook' | 'instagram' | 'tiktok'
  form: FormState
  update: (field: string, value: string | File | null) => void
  fileRef: React.RefObject<HTMLInputElement | null>
  screenshotRef: React.RefObject<HTMLInputElement | null>
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleScreenshot: (e: React.ChangeEvent<HTMLInputElement>) => void
  paymentMethod: 'paystack' | 'flutterwave' | null
  setPaymentMethod: (m: 'paystack' | 'flutterwave') => void
  agreed: boolean
  setAgreed: (v: boolean) => void
  submitError: string
  submitting: boolean
  isValid: () => boolean
  handleSubmitAndPay: () => void
  priceNGN: number
  priceUSD: number
}

function RecoveryForm({
  platform, form, update, fileRef, screenshotRef,
  handleFile, handleScreenshot, paymentMethod, setPaymentMethod,
  agreed, setAgreed, submitError, submitting, isValid,
  handleSubmitAndPay, priceNGN, priceUSD,
}: RecoveryFormProps) {
  const config = PLATFORM_CONFIG[platform]

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: '1.5px solid rgba(124,58,237,0.2)',
    background: 'var(--input-bg, #f9f9ff)',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    color: 'var(--input-text, #1a1a1a)',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--label-color, #374151)',
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '8px',
  }

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#7c3aed'
    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
  }

  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(124,58,237,0.2)'
    e.target.style.boxShadow = 'none'
  }

  const valid = isValid()

  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      border: `1px solid rgba(${config.rgbColor},0.2)`,
      borderRadius: '24px',
      padding: 'clamp(24px, 4vw, 40px)',
      boxShadow: '0 4px 40px rgba(0,0,0,0.04)',
    }} className="dark:bg-gray-900">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `rgba(${config.rgbColor},0.1)`, border: `1px solid rgba(${config.rgbColor},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
          {config.icon}
        </div>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: 'var(--heading-color, #1a1a1a)' }} className="dark:text-white">Support Form</h2>
          <p style={{ fontSize: '13px', color: 'var(--body-color, #6b5fa0)', margin: 0 }} className="dark:text-gray-400">Fill in all fields accurately. Incorrect info may delay recovery.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* Handle field */}
        <div>
          <label style={labelStyle} className="dark:text-gray-300">{config.handleLabel}</label>
          {config.handlePrefix ? (
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#9d8fd4', pointerEvents: 'none' }}>
                {config.handlePrefix}
              </span>
              <input
                type="text"
                value={form.facebookHandle}
                onChange={e => update('facebookHandle', e.target.value)}
                placeholder={config.handlePlaceholder}
                style={{ ...inputStyle, paddingLeft: '106px' }}
                onFocus={focusInput}
                onBlur={blurInput}
                className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
              />
            </div>
          ) : (
            <input
              type="text"
              value={form.facebookHandle}
              onChange={e => update('facebookHandle', e.target.value)}
              placeholder={config.handlePlaceholder}
              style={inputStyle}
              onFocus={focusInput}
              onBlur={blurInput}
              className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
            />
          )}
        </div>

        {/* First Name + Surname */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'First Name *', field: 'firstName', placeholder: 'First name' },
            { label: 'Surname *', field: 'surname', placeholder: 'Surname' },
          ].map(f => (
            <div key={f.field}>
              <label style={labelStyle} className="dark:text-gray-300">{f.label}</label>
              <input
                type="text"
                value={form[f.field as keyof FormState] as string}
                onChange={e => update(f.field, e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
                className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
              />
            </div>
          ))}
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle} className="dark:text-gray-300">Email Address *</label>
          <input
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            placeholder="your@email.com"
            style={inputStyle}
            onFocus={focusInput}
            onBlur={blurInput}
            className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
          />
        </div>

        {/* Phone */}
        <div>
          <label style={labelStyle} className="dark:text-gray-300">Preferred Phone Number *</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="+234 800 000 0000"
            style={inputStyle}
            onFocus={focusInput}
            onBlur={blurInput}
            className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
          />
        </div>

        {/* Support type */}
        <div>
          <label style={labelStyle} className="dark:text-gray-300">What do you need support with? *</label>
          <select
            value={form.supportType}
            onChange={e => update('supportType', e.target.value)}
            style={{
              ...inputStyle,
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239d8fd4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingRight: '40px',
              color: form.supportType ? 'var(--input-text, #1a1a1a)' : '#9d8fd4',
            }}
            onFocus={focusInput}
            onBlur={blurInput}
            className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
          >
            <option value="">— Select an option —</option>
            {config.supportOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ID Upload */}
        <div>
          <label style={labelStyle} className="dark:text-gray-300">Upload Means of Identification *</label>
          <p style={{ fontSize: '12px', color: '#9d8fd4', margin: '0 0 10px' }}>
            Accepted: Digital NIN, International Passport, National ID, Driver's License
          </p>
          <input ref={fileRef} type="file" onChange={handleFile} accept="image/*,.pdf" style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100%',
              border: `2px dashed ${form.idFileName ? '#7c3aed' : 'rgba(124,58,237,0.25)'}`,
              borderRadius: '14px',
              padding: '28px 20px',
              background: form.idFileName ? 'rgba(124,58,237,0.05)' : 'var(--input-bg, #f9f9ff)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
            className="dark:bg-gray-800/50"
          >
            {form.idFileName ? (
              <>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed', margin: '0 0 4px' }}>{form.idFileName}</p>
                <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>Click to change file</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📎</div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--heading-color, #1a1a1a)', margin: '0 0 4px' }} className="dark:text-white">Click to upload your ID</p>
                <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>JPG, PNG or PDF — Max 5MB</p>
              </>
            )}
          </button>
        </div>

        {/* Screenshot Upload */}
        <div>
          <label style={labelStyle} className="dark:text-gray-300">
            Upload Account Screenshot{' '}
            <span style={{ color: '#9d8fd4', fontWeight: 400 }}>(Optional but Recommended)</span>
          </label>
          <p style={{ fontSize: '12px', color: '#9d8fd4', margin: '0 0 10px' }}>
            Screenshot of the disabled, suspended or hacked account error page. Speeds up recovery.
          </p>
          <input ref={screenshotRef} type="file" onChange={handleScreenshot} accept="image/*" style={{ display: 'none' }} />
          <button
            type="button"
            onClick={() => screenshotRef.current?.click()}
            style={{
              width: '100%',
              border: `2px dashed ${form.screenshotFileName ? '#10b981' : 'rgba(124,58,237,0.2)'}`,
              borderRadius: '14px',
              padding: '24px 20px',
              background: form.screenshotFileName ? 'rgba(16,185,129,0.04)' : 'var(--input-bg, #f9f9ff)',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
            className="dark:bg-gray-800/50"
          >
            {form.screenshotFileName ? (
              <>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🖼️</div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', margin: '0 0 4px' }}>{form.screenshotFileName}</p>
                <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>Click to change screenshot</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--heading-color, #1a1a1a)', margin: '0 0 4px' }} className="dark:text-white">Click to upload screenshot</p>
                <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>JPG or PNG — Max 5MB</p>
              </>
            )}
          </button>
        </div>

        {/* Additional Info */}
        <div>
          <label style={labelStyle} className="dark:text-gray-300">Additional Information *</label>
          <textarea
            value={form.additionalInfo}
            onChange={e => update('additionalInfo', e.target.value)}
            placeholder="Describe when you lost access, what happened, any details that could help us recover your account faster..."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
            onFocus={focusInput}
            onBlur={blurInput}
            className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
          />
        </div>

        {/* Terms */}
        <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '14px', padding: '20px' }} className="dark:bg-purple-900/10 dark:border-purple-800/30">
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--heading-color, #1a1a1a)', margin: '0 0 12px' }} className="dark:text-white">
            📋 Terms & Conditions
          </p>
          <div style={{ maxHeight: '160px', overflowY: 'auto', fontSize: '12px', lineHeight: 1.8, color: 'var(--body-color, #6b5fa0)', marginBottom: '16px', paddingRight: '8px' }} className="dark:text-gray-400">
            <p><strong style={{ color: 'var(--heading-color, #1a1a1a)' }} className="dark:text-white">1. Timeline:</strong>{' '}Recovery takes <strong style={{ color: '#f59e0b' }}>14–30 business days</strong>. Platform response times are beyond our control.</p>
            <br />
            <p><strong style={{ color: 'var(--heading-color, #1a1a1a)' }} className="dark:text-white">2. Non-Refundable:</strong>{' '}<strong style={{ color: '#ef4444' }}>ALL PAYMENTS ARE STRICTLY NON-REFUNDABLE.</strong> You are paying for professional services and time regardless of outcome.</p>
            <br />
            <p><strong style={{ color: 'var(--heading-color, #1a1a1a)' }} className="dark:text-white">3. No Guarantee:</strong>{' '}While we have a high success rate, PurpleSoftHub cannot guarantee 100% recovery. Final decisions rest with the platform.</p>
            <br />
            <p><strong style={{ color: 'var(--heading-color, #1a1a1a)' }} className="dark:text-white">4. Accurate Info:</strong>{' '}You must provide truthful information. False information may result in failure and forfeiture of payment without refund.</p>
            <br />
            <p><strong style={{ color: 'var(--heading-color, #1a1a1a)' }} className="dark:text-white">5. Privacy:</strong>{' '}All personal information is kept strictly confidential and used only for account recovery purposes.</p>
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#7c3aed', cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: '13px', color: 'var(--body-color, #6b5fa0)', lineHeight: 1.6 }} className="dark:text-gray-400">
              I agree to the <strong style={{ color: '#7c3aed' }}>Terms & Conditions</strong>. Payment is{' '}
              <strong style={{ color: '#ef4444' }}>NON-REFUNDABLE</strong> and recovery takes{' '}
              <strong style={{ color: '#f59e0b' }}>14–30 business days</strong>.
            </span>
          </label>
        </div>

        {/* Payment Method */}
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--label-color, #374151)', marginBottom: '12px' }} className="dark:text-gray-300">
            Select Payment Method *
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { id: 'paystack' as const, label: '💳 Paystack', sub: 'Cards · Bank · USSD', activeColor: '#0BA4DB', activeBg: 'rgba(11,164,219,0.08)' },
              { id: 'flutterwave' as const, label: '🌊 Flutterwave', sub: 'International · Mobile', activeColor: '#F5A623', activeBg: 'rgba(245,166,35,0.08)' },
            ].map(pm => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethod(pm.id)}
                style={{
                  padding: '14px 12px',
                  borderRadius: '12px',
                  border: paymentMethod === pm.id ? `2px solid ${pm.activeColor}` : '1.5px solid rgba(124,58,237,0.2)',
                  background: paymentMethod === pm.id ? pm.activeBg : 'var(--input-bg, #f9f9ff)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
                className="dark:bg-gray-800/50"
              >
                <p style={{ fontSize: '14px', fontWeight: 700, color: paymentMethod === pm.id ? pm.activeColor : 'var(--heading-color, #1a1a1a)', margin: '0 0 4px' }} className="dark:text-white">{pm.label}</p>
                <p style={{ fontSize: '11px', color: '#9d8fd4', margin: 0 }}>{pm.sub}</p>
                {paymentMethod === pm.id && (
                  <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', fontWeight: 700, color: pm.activeColor, background: pm.activeBg, padding: '2px 8px', borderRadius: '100px' }}>✓ Selected</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {submitError && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚠️ {submitError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmitAndPay}
          disabled={submitting || !valid}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: 'none',
            background: valid
              ? paymentMethod === 'flutterwave'
                ? 'linear-gradient(135deg, #F5A623, #e8971a)'
                : 'linear-gradient(135deg, #7c3aed, #a855f7)'
              : 'rgba(124,58,237,0.2)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 800,
            cursor: valid ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: valid
              ? paymentMethod === 'flutterwave'
                ? '0 8px 30px rgba(245,166,35,0.35)'
                : '0 8px 30px rgba(124,58,237,0.35)'
              : 'none',
            transition: 'all 0.2s',
            letterSpacing: '0.01em',
          }}
        >
          {submitting ? (
            <>
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Processing...
            </>
          ) : (
            <>
              {paymentMethod === 'paystack' && '💳'}
              {paymentMethod === 'flutterwave' && '🌊'}
              {!paymentMethod && '🔐'}
              {' '}
              {paymentMethod
                ? `Pay ₦${priceNGN.toLocaleString()} / $${priceUSD} via ${paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}`
                : 'Select Payment Method Above'
              }
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#9d8fd4', margin: '-8px 0 0' }}>
          🔒 Secured payment · Non-refundable · 14–30 business days
        </p>

      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────

export default function AccountRecoveryPage() {
  const [activeTab, setActiveTab] = useState('facebook')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const screenshotRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const update = (field: string, value: string | File | null) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { update('idFile', file); update('idFileName', file.name) }
  }

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { update('screenshotFile', file); update('screenshotFileName', file.name) }
  }

  const isValid = () =>
    !!(form.firstName && form.surname &&
      form.facebookHandle &&
      form.email && form.phone &&
      form.supportType && form.additionalInfo &&
      form.idFile && agreed && paymentMethod !== null)

  const activePlatform = PLATFORMS.find(p => p.id === activeTab)!

  const resetTab = (id: string) => {
    setActiveTab(id)
    setForm(EMPTY_FORM)
    setPaymentMethod(null)
    setAgreed(false)
    setSubmitError('')
  }

  const handleSubmitAndPay = async () => {
    if (!isValid()) {
      setSubmitError('Please fill all fields, upload your ID, select a payment method and agree to terms.')
      return
    }
    setSubmitting(true)
    setSubmitError('')

    const fullName = `${form.firstName} ${form.surname}`.trim()
    const priceNGN = activePlatform.price_ngn

    try {
      const formData = new FormData()
      formData.append('fullName', fullName)
      Object.entries(form).forEach(([k, v]) => {
        if (v && k !== 'idFile' && k !== 'screenshotFile' && k !== 'idFileName' && k !== 'screenshotFileName') {
          formData.append(k, v as string)
        }
      })
      if (form.idFile) formData.append('idFile', form.idFile)
      if (form.screenshotFile) formData.append('screenshotFile', form.screenshotFile)
      formData.append('platform', activeTab)
      formData.append('amount', String(priceNGN))
      formData.append('paymentMethod', paymentMethod!)

      await fetch('/api/account-recovery', { method: 'POST', body: formData })

      if (paymentMethod === 'paystack') {
        const res = await fetch('/api/payments/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            amount: priceNGN,
            currency: 'NGN',
            metadata: { service: 'account-recovery', platform: activeTab, fullName, phone: form.phone, payment_method: 'paystack' },
            callback_url: `${window.location.origin}/services/social-media-management/account-recovery/success`,
          }),
        })
        const data = await res.json()
        if (data.authorization_url) {
          window.location.href = data.authorization_url
        } else {
          setSubmitError(data.error || 'Paystack payment failed. Please try again.')
        }
      } else if (paymentMethod === 'flutterwave') {
        const res = await fetch('/api/payments/flutterwave/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            amount: priceNGN,
            currency: 'NGN',
            name: fullName,
            phone: form.phone,
            meta: { service: 'account-recovery', platform: activeTab, payment_method: 'flutterwave' },
            redirect_url: `${window.location.origin}/services/social-media-management/account-recovery/success`,
          }),
        })
        const data = await res.json()
        if (data.payment_link) {
          window.location.href = data.payment_link
        } else {
          setSubmitError(data.error || 'Flutterwave payment failed. Please try again.')
        }
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{ background: 'linear-gradient(135deg, #06030f 0%, #0d0520 60%, #1a0535 100%)', padding: 'clamp(60px, 8vw, 100px) 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '100px', padding: '6px 18px', marginBottom: '24px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a855f7', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#a855f7', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Social Media Management</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: 'var(--hero-heading, #fff)', margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            Social Media{' '}
            <span style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Account Recovery
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'var(--hero-body, #9d8fd4)', margin: '0 0 36px', lineHeight: 1.7, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
            Professional recovery for hacked or disabled social media accounts. Secure, confidential and reliable.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 4vw, 48px)', flexWrap: 'wrap' }}>
            {[{ value: '14–30', label: 'Business Days' }, { value: '100%', label: 'Confidential' }, { value: '3', label: 'Platforms' }].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, margin: '0 0 4px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.value}</p>
                <p style={{ fontSize: '12px', color: '#6b5fa0', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(40px, 5vw, 64px) 16px' }}>

        {/* Platform tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => resetTab(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 24px', borderRadius: '100px',
                border: activeTab === p.id ? `2px solid ${p.color}` : '2px solid rgba(124,58,237,0.15)',
                background: activeTab === p.id ? p.bg : 'transparent',
                cursor: 'pointer', transition: 'all 0.2s',
                fontWeight: 700, fontSize: '14px',
                color: activeTab === p.id ? p.color : '#6b5fa0',
              }}
            >
              <span style={{ fontSize: '20px' }}>{p.icon}</span>
              {p.name}
              <span style={{
                fontSize: '12px', fontWeight: 700,
                background: activeTab === p.id ? p.bg : 'rgba(124,58,237,0.08)',
                border: `1px solid ${activeTab === p.id ? p.border : 'rgba(124,58,237,0.15)'}`,
                color: activeTab === p.id ? p.color : '#9d8fd4',
                padding: '2px 8px', borderRadius: '100px',
              }}>
                ${p.price_usd}
              </span>
            </button>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'start' }} className="recovery-grid">

          {/* ── LEFT — FORM ── */}
          <div>
            {activeTab === 'facebook' && (
              <RecoveryForm
                platform="facebook"
                form={form} update={update}
                fileRef={fileRef} screenshotRef={screenshotRef}
                handleFile={handleFile} handleScreenshot={handleScreenshot}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                agreed={agreed} setAgreed={setAgreed}
                submitError={submitError} submitting={submitting}
                isValid={isValid} handleSubmitAndPay={handleSubmitAndPay}
                priceNGN={42000} priceUSD={30}
              />
            )}
            {activeTab === 'instagram' && (
              <RecoveryForm
                platform="instagram"
                form={form} update={update}
                fileRef={fileRef} screenshotRef={screenshotRef}
                handleFile={handleFile} handleScreenshot={handleScreenshot}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                agreed={agreed} setAgreed={setAgreed}
                submitError={submitError} submitting={submitting}
                isValid={isValid} handleSubmitAndPay={handleSubmitAndPay}
                priceNGN={75000} priceUSD={50}
              />
            )}
            {activeTab === 'tiktok' && (
              <RecoveryForm
                platform="tiktok"
                form={form} update={update}
                fileRef={fileRef} screenshotRef={screenshotRef}
                handleFile={handleFile} handleScreenshot={handleScreenshot}
                paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
                agreed={agreed} setAgreed={setAgreed}
                submitError={submitError} submitting={submitting}
                isValid={isValid} handleSubmitAndPay={handleSubmitAndPay}
                priceNGN={75000} priceUSD={50}
              />
            )}
          </div>

          {/* ── RIGHT — SIDEBAR ── */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Price card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(168,85,247,0.04))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px', padding: '24px' }} className="dark:bg-purple-900/10 dark:border-purple-800/30">
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#9d8fd4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>Service Fee</p>
              <p style={{ fontSize: '36px', fontWeight: 900, color: '#7c3aed', margin: '0 0 4px', lineHeight: 1 }}>₦{activePlatform.price_ngn.toLocaleString()}</p>
              <p style={{ fontSize: '14px', color: '#9d8fd4', margin: '0 0 20px' }}>${activePlatform.price_usd} USD one-time payment</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  { icon: '⏱', text: '14–30 business days' },
                  { icon: '🔒', text: 'Strictly non-refundable' },
                  { icon: '🛡️', text: 'Confidential & secure' },
                  { icon: '📧', text: 'Email + WhatsApp updates' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#6b5fa0' }} className="dark:text-gray-400">
                    <span>{item.icon}</span>{item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Platform comparison */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '20px', padding: '20px' }} className="dark:bg-gray-900 dark:border-purple-800/30">
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#9d8fd4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>All Platforms</p>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => resetTab(p.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: '10px',
                    border: activeTab === p.id ? `1.5px solid ${p.color}` : '1.5px solid transparent',
                    background: activeTab === p.id ? p.bg : 'transparent',
                    cursor: 'pointer', marginBottom: '6px', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{p.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: activeTab === p.id ? p.color : '#6b5fa0' }} className="dark:text-gray-400">{p.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: activeTab === p.id ? p.color : '#9d8fd4' }}>${p.price_usd}</span>
                </button>
              ))}
            </div>

            {/* WhatsApp help */}
            <Link
              href="https://wa.me/message/BPNJE7CPON3OJ1"
              target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '16px', textDecoration: 'none', transition: 'all 0.2s' }}
              className="dark:bg-green-900/10 dark:border-green-800/30 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💬</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#25D366', margin: '0 0 2px' }}>Need help? Chat with us</p>
                <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }} className="dark:text-gray-400">WhatsApp · Fast response</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        :root {
          --card-bg: #ffffff;
          --heading-color: #1a1a1a;
          --body-color: #6b5fa0;
          --label-color: #374151;
          --input-bg: #f9f9ff;
          --input-text: #1a1a1a;
          --hero-heading: #1a1a1a;
          --hero-body: #555555;
        }
        .dark {
          --card-bg: #0a0618;
          --heading-color: #ffffff;
          --body-color: #9d8fd4;
          --label-color: #d1d5db;
          --input-bg: rgba(124,58,237,0.06);
          --input-text: #ffffff;
          --hero-heading: #ffffff;
          --hero-body: #9d8fd4;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (max-width: 900px) {
          .recovery-grid { grid-template-columns: 1fr !important; }
        }
        input, textarea, select { color: var(--input-text) !important; }
        input::placeholder, textarea::placeholder { color: #9d8fd4 !important; opacity: 1 !important; }
      `}</style>
      <Footer />
    </>
  )
}
