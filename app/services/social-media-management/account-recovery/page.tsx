'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/Navbar'

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
    hasForm: true,
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
    hasForm: false,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#010101',
    gradient: 'linear-gradient(135deg, #010101, #69C9D0)',
    bg: 'rgba(105,201,208,0.08)',
    border: 'rgba(105,201,208,0.25)',
    price_ngn: 75000,
    price_usd: 50,
    hasForm: false,
  },
]

const inputClass = `
  w-full px-4 py-3 rounded-xl
  border transition-all duration-200
  text-sm font-medium
  outline-none
  bg-white dark:bg-gray-900
  border-gray-200 dark:border-gray-700
  text-gray-900 dark:text-white
  placeholder-gray-400
  dark:placeholder-gray-500
  focus:border-purple-500
  dark:focus:border-purple-400
  focus:ring-2 focus:ring-purple-500/20
`

const labelClass = `
  block text-sm font-600 mb-2
  text-gray-700 dark:text-gray-300
`

export default function AccountRecoveryPage() {
  const [activeTab, setActiveTab] = useState('facebook')
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    fullName: '',
    facebookHandle: '',
    firstName: '',
    surname: '',
    email: '',
    phone: '',
    supportType: '',
    additionalInfo: '',
    idFile: null as File | null,
    idFileName: '',
  })

  const update = (field: string, value: string | File | null) =>
    setForm(p => ({ ...p, [field]: value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      update('idFile', file)
      update('idFileName', file.name)
    }
  }

  const isValid = () =>
    form.fullName && form.facebookHandle &&
    form.firstName && form.surname &&
    form.email && form.phone &&
    form.supportType &&
    form.additionalInfo &&
    form.idFile && agreed

  const activePlatform = PLATFORMS.find(p => p.id === activeTab)!

  const handleSubmitAndPay = async () => {
    if (!isValid()) {
      setSubmitError(
        'Please fill all fields, upload your ID and agree to the terms.'
      )
      return
    }
    setSubmitting(true)
    setSubmitError('')

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v && k !== 'idFile') formData.append(k, v as string)
      })
      if (form.idFile) formData.append('idFile', form.idFile)
      formData.append('platform', activeTab)
      formData.append('amount', '42000')

      await fetch('/api/account-recovery', {
        method: 'POST',
        body: formData,
      })

      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          amount: 42000,
          currency: 'NGN',
          metadata: {
            service: 'account-recovery',
            platform: activeTab,
            fullName: form.fullName,
          },
          callback_url: `${window.location.origin}/services/social-media-management/account-recovery/success`,
        }),
      })
      const data = await res.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        setSubmitError(data.error || 'Payment failed. Please try again.')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  return (
    <>
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #06030f 0%, #0d0520 60%, #1a0535 100%)',
          padding: 'clamp(60px, 8vw, 100px) 24px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '700px',
            margin: '0 auto',
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: '100px',
              padding: '6px 18px',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#a855f7',
                animation: 'pulse 2s infinite',
                display: 'inline-block',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#a855f7',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Social Media Management
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 20px',
              lineHeight: 1.1,
              letterSpacing: '-0.5px',
            }}
          >
            Social Media{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Account Recovery
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#9d8fd4',
              margin: '0 0 36px',
              lineHeight: 1.7,
              maxWidth: '520px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Professional recovery for hacked or disabled social media accounts.
            Secure, confidential and reliable.
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(20px, 4vw, 48px)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { value: '14–30', label: 'Business Days' },
              { value: '100%', label: 'Confidential' },
              { value: '3', label: 'Platforms' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: 'clamp(24px, 3vw, 32px)',
                    fontWeight: 900,
                    color: '#fff',
                    margin: '0 0 4px',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b5fa0',
                    margin: 0,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: 'clamp(40px, 5vw, 64px) 16px',
        }}
      >
        {/* Platform tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setActiveTab(p.id)
                setSubmitError('')
                setAgreed(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 24px',
                borderRadius: '100px',
                border: activeTab === p.id ? `2px solid ${p.color}` : '2px solid rgba(124,58,237,0.15)',
                background: activeTab === p.id ? p.bg : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 700,
                fontSize: '14px',
                color: activeTab === p.id ? p.color : '#6b5fa0',
              }}
            >
              <span style={{ fontSize: '20px' }}>{p.icon}</span>
              {p.name}
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  background: activeTab === p.id ? p.bg : 'rgba(124,58,237,0.08)',
                  border: `1px solid ${activeTab === p.id ? p.border : 'rgba(124,58,237,0.15)'}`,
                  color: activeTab === p.id ? p.color : '#9d8fd4',
                  padding: '2px 8px',
                  borderRadius: '100px',
                }}
              >
                ${p.price_usd}
              </span>
            </button>
          ))}
        </div>

        {/* Two column layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '28px',
            alignItems: 'start',
          }}
          className="recovery-grid"
        >
          {/* ── LEFT — FORM ── */}
          <div>
            {/* Facebook form */}
            {activeTab === 'facebook' && (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(24,119,242,0.2)',
                  borderRadius: '24px',
                  padding: 'clamp(24px, 4vw, 40px)',
                  boxShadow: '0 4px 40px rgba(24,119,242,0.06)',
                }}
                className="dark:bg-gray-900 dark:border-blue-900/30"
              >
                {/* Form header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '32px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid rgba(124,58,237,0.1)',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'rgba(24,119,242,0.1)',
                      border: '1px solid rgba(24,119,242,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      flexShrink: 0,
                    }}
                  >
                    📘
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: '22px',
                        fontWeight: 800,
                        margin: '0 0 4px',
                        color: '#1a1a1a',
                      }}
                      className="dark:text-white"
                    >
                      Support Form
                    </h2>
                    <p
                      style={{
                        fontSize: '13px',
                        color: '#6b5fa0',
                        margin: 0,
                      }}
                      className="dark:text-gray-400"
                    >
                      Fill in all fields accurately. Incorrect info may delay recovery.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Full Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }} className="dark:text-gray-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => update('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(124,58,237,0.2)',
                        background: '#f9f9ff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#1a1a1a',
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#7c3aed'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Facebook Handle */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }} className="dark:text-gray-300">
                      Facebook Handle *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#9d8fd4', pointerEvents: 'none' }}>
                        facebook.com/
                      </span>
                      <input
                        type="text"
                        value={form.facebookHandle}
                        onChange={e => update('facebookHandle', e.target.value)}
                        placeholder="yourprofilename"
                        style={{
                          width: '100%',
                          padding: '13px 16px',
                          paddingLeft: '106px',
                          borderRadius: '12px',
                          border: '1.5px solid rgba(124,58,237,0.2)',
                          background: '#f9f9ff',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                          color: '#1a1a1a',
                        }}
                        className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
                        onFocus={e => {
                          e.currentTarget.style.borderColor = '#7c3aed'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
                        }}
                        onBlur={e => {
                          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* First + Surname */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { label: 'First Name *', field: 'firstName', placeholder: 'First name' },
                      { label: 'Surname *', field: 'surname', placeholder: 'Surname' },
                    ].map(f => (
                      <div key={f.field}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }} className="dark:text-gray-300">
                          {f.label}
                        </label>
                        <input
                          type="text"
                          value={form[f.field as keyof typeof form] as string}
                          onChange={e => update(f.field, e.target.value)}
                          placeholder={f.placeholder}
                          style={{
                            width: '100%',
                            padding: '13px 16px',
                            borderRadius: '12px',
                            border: '1.5px solid rgba(124,58,237,0.2)',
                            background: '#f9f9ff',
                            fontSize: '14px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxSizing: 'border-box',
                            fontFamily: 'inherit',
                            color: '#1a1a1a',
                          }}
                          className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
                          onFocus={e => {
                            e.currentTarget.style.borderColor = '#7c3aed'
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }} className="dark:text-gray-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => update('email', e.target.value)}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(124,58,237,0.2)',
                        background: '#f9f9ff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#1a1a1a',
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#7c3aed'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }} className="dark:text-gray-300">
                      Preferred Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      placeholder="+234 800 000 0000"
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(124,58,237,0.2)',
                        background: '#f9f9ff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#1a1a1a',
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#7c3aed'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Support type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }} className="dark:text-gray-300">
                      What do you need support with? *
                    </label>
                    <select
                      value={form.supportType}
                      onChange={e => update('supportType', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(124,58,237,0.2)',
                        background: '#f9f9ff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: form.supportType ? '#1a1a1a' : '#9d8fd4',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239d8fd4' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        paddingRight: '40px',
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
                    >
                      <option value="">— Select an option —</option>
                      <option value="hacked">🔓 Account Hacked</option>
                      <option value="disabled">🚫 Disabled Account</option>
                    </select>
                  </div>

                  {/* File upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: '#374151' }} className="dark:text-gray-300">
                      Upload Means of Identification *
                    </label>
                    <p style={{ fontSize: '12px', color: '#9d8fd4', margin: '0 0 10px' }}>
                      Accepted: Digital NIN, International Passport, National ID, Driver's License
                    </p>
                    <input ref={fileRef} type="file" onChange={handleFile} accept="image/*,.pdf" style={{ display: 'none' }} />
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        width: '100%',
                        border: `2px dashed ${form.idFileName ? '#7c3aed' : 'rgba(124,58,237,0.25)'}`,
                        borderRadius: '14px',
                        padding: '28px 20px',
                        background: form.idFileName ? 'rgba(124,58,237,0.05)' : '#f9f9ff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                      className="dark:bg-gray-800/50"
                    >
                      {form.idFileName ? (
                        <>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px' }}>
                            ✅
                          </div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#7c3aed', margin: '0 0 4px' }}>{form.idFileName}</p>
                          <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>Click to change file</p>
                        </>
                      ) : (
                        <>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '20px' }}>
                            📎
                          </div>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }} className="dark:text-white">
                            Click to upload your ID
                          </p>
                          <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }}>JPG, PNG or PDF — Max 5MB</p>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Additional info */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#374151' }} className="dark:text-gray-300">
                      Additional Information *
                    </label>
                    <textarea
                      value={form.additionalInfo}
                      onChange={e => update('additionalInfo', e.target.value)}
                      placeholder="Describe when you lost access, what happened, any details that could help us recover your account faster..."
                      rows={5}
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        border: '1.5px solid rgba(124,58,237,0.2)',
                        background: '#f9f9ff',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                        color: '#1a1a1a',
                        resize: 'vertical',
                        minHeight: '120px',
                      }}
                      className="dark:bg-gray-800 dark:text-white dark:border-purple-900/30"
                      onFocus={e => {
                        e.currentTarget.style.borderColor = '#7c3aed'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'
                      }}
                      onBlur={e => {
                        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Terms */}
                  <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '14px', padding: '20px' }} className="dark:bg-purple-900/10 dark:border-purple-800/30">
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }} className="dark:text-white">
                      📋 Terms & Conditions
                    </p>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', fontSize: '12px', lineHeight: 1.8, color: '#6b5fa0', marginBottom: '16px', paddingRight: '8px' }} className="dark:text-gray-400">
                      <p>
                        <strong style={{ color: '#1a1a1a' }} className="dark:text-white">
                          1. Timeline:
                        </strong>{' '}
                        Recovery takes <strong style={{ color: '#f59e0b' }}>14–30 business days</strong>. Platform response times are beyond our control.
                      </p>
                      <br />
                      <p>
                        <strong style={{ color: '#1a1a1a' }} className="dark:text-white">
                          2. Non-Refundable:
                        </strong>{' '}
                        <strong style={{ color: '#ef4444' }}>ALL PAYMENTS ARE STRICTLY NON-REFUNDABLE.</strong> You are paying for professional services and time regardless of outcome.
                      </p>
                      <br />
                      <p>
                        <strong style={{ color: '#1a1a1a' }} className="dark:text-white">
                          3. No Guarantee:
                        </strong>{' '}
                        While we have a high success rate, PurpleSoftHub cannot guarantee 100% recovery. Final decisions rest with the platform.
                      </p>
                      <br />
                      <p>
                        <strong style={{ color: '#1a1a1a' }} className="dark:text-white">
                          4. Accurate Info:
                        </strong>{' '}
                        You must provide truthful information. False information may result in failure and forfeiture of payment without refund.
                      </p>
                      <br />
                      <p>
                        <strong style={{ color: '#1a1a1a' }} className="dark:text-white">
                          5. Privacy:
                        </strong>{' '}
                        All personal information is kept strictly confidential and used only for account recovery purposes.
                      </p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#7c3aed', cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '13px', color: '#6b5fa0', lineHeight: 1.6 }} className="dark:text-gray-400">
                        I agree to the <strong style={{ color: '#7c3aed' }}> Terms & Conditions</strong>. I understand payment is{' '}
                        <strong style={{ color: '#ef4444' }}> NON-REFUNDABLE</strong> and recovery takes{' '}
                        <strong style={{ color: '#f59e0b' }}> 14–30 business days</strong>.
                      </span>
                    </label>
                  </div>

                  {/* Error */}
                  {submitError && (
                    <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⚠️ {submitError}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    onClick={handleSubmitAndPay}
                    disabled={submitting || !isValid()}
                    style={{
                      width: '100%',
                      padding: '16px',
                      borderRadius: '14px',
                      border: 'none',
                      background: isValid() ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'rgba(124,58,237,0.2)',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: 800,
                      cursor: isValid() ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: isValid() ? '0 8px 30px rgba(124,58,237,0.35)' : 'none',
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
                      <>🔐 Submit & Pay ₦42,000 / $30</>
                    )}
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '12px', color: '#9d8fd4', margin: '-8px 0 0' }}>
                    🔒 Secured by Paystack · Non-refundable · 14–30 business days
                  </p>
                </div>
              </div>
            )}

            {/* Instagram + TikTok — WhatsApp */}
            {(activeTab === 'instagram' || activeTab === 'tiktok') && (
              <div style={{ background: '#ffffff', border: `1px solid ${activePlatform.border}`, borderRadius: '24px', padding: 'clamp(24px, 4vw, 40px)', textAlign: 'center' }} className="dark:bg-gray-900">
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: activePlatform.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 24px' }}>
                  {activePlatform.icon}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }} className="dark:text-white">
                  {activePlatform.name} Account Recovery
                </h2>

                <p style={{ fontSize: '15px', color: '#6b5fa0', lineHeight: 1.7, margin: '0 0 32px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }} className="dark:text-gray-400">
                  {activePlatform.name} recovery is handled via WhatsApp consultation. Message us to begin your recovery process.
                </p>

                <div style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '16px', padding: '20px', marginBottom: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'left' }} className="dark:bg-purple-900/10 dark:border-purple-800/30">
                  {['✅ Hacked account recovery', '✅ Disabled account appeal', '✅ Login verification issues', '✅ Two-factor auth recovery', '✅ Email/phone recovery', '✅ Account restoration'].map(item => (
                    <div key={item} style={{ fontSize: '13px', color: '#6b5fa0' }} className="dark:text-gray-400">
                      {item}
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: '28px', fontWeight: 900, color: '#7c3aed', margin: '0 0 4px' }}>₦{activePlatform.price_ngn.toLocaleString()}</p>
                <p style={{ fontSize: '14px', color: '#9d8fd4', margin: '0 0 24px' }}>
                  ${activePlatform.price_usd} USD · Non-refundable · 14–30 days
                </p>

                <Link
                  href="https://wa.me/message/BPNJE7CPON3OJ1"
                  target="_blank"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#25D366', color: '#fff', padding: '14px 32px', borderRadius: '14px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 20px rgba(37,211,102,0.3)' }}
                >
                  💬 Start {activePlatform.name} Recovery
                </Link>
              </div>
            )}
          </div>

          {/* ── RIGHT — INFO SIDEBAR ── */}
          <div style={{ position: 'sticky', top: '90px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Price card */}
            <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(168,85,247,0.04))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px', padding: '24px' }} className="dark:bg-purple-900/10 dark:border-purple-800/30">
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#9d8fd4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px' }}>
                Service Fee
              </p>
              <p style={{ fontSize: '36px', fontWeight: 900, color: '#7c3aed', margin: '0 0 4px', lineHeight: 1 }}>
                ₦{activePlatform.price_ngn.toLocaleString()}
              </p>
              <p style={{ fontSize: '14px', color: '#9d8fd4', margin: '0 0 20px' }}>
                ${activePlatform.price_usd} USD one-time payment
              </p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  { icon: '⏱', text: '14–30 business days' },
                  { icon: '🔒', text: 'Strictly non-refundable' },
                  { icon: '🛡️', text: 'Confidential & secure' },
                  { icon: '📧', text: 'Email + WhatsApp updates' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#6b5fa0' }} className="dark:text-gray-400">
                    <span>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Platform comparison */}
            <div style={{ background: '#ffffff', border: '1px solid rgba(124,58,237,0.12)', borderRadius: '20px', padding: '20px' }} className="dark:bg-gray-900 dark:border-purple-800/30">
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#9d8fd4', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                All Platforms
              </p>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: activeTab === p.id ? `1.5px solid ${p.color}` : '1.5px solid transparent',
                    background: activeTab === p.id ? p.bg : 'transparent',
                    cursor: 'pointer',
                    marginBottom: '6px',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{p.icon}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: activeTab === p.id ? p.color : '#6b5fa0' }} className="dark:text-gray-400">
                      {p.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: activeTab === p.id ? p.color : '#9d8fd4' }}>
                    ${p.price_usd}
                  </span>
                </button>
              ))}
            </div>

            {/* WhatsApp help */}
            <Link
              href="https://wa.me/message/BPNJE7CPON3OJ1"
              target="_blank"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: '16px', padding: '16px', textDecoration: 'none', transition: 'all 0.2s' }} className="dark:bg-green-900/10 dark:border-green-800/30 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                💬
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#25D366', margin: '0 0 2px' }}>
                  Need help? Chat with us
                </p>
                <p style={{ fontSize: '12px', color: '#9d8fd4', margin: 0 }} className="dark:text-gray-400">
                  WhatsApp · Fast response
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CSS */}
      <style>{`
        :root {
          --card-bg: #ffffff;
          --heading-color: #1a1a1a;
          --body-color: #6b5fa0;
          --label-color: #374151;
          --input-bg: #f9f9ff;
          --input-text: #1a1a1a;
          --tab-color: #6b5fa0;
        }
        .dark {
          --card-bg: #0a0618;
          --heading-color: #ffffff;
          --body-color: #9d8fd4;
          --label-color: #d1d5db;
          --input-bg: rgba(124,58,237,0.06);
          --input-text: #ffffff;
          --tab-color: #9d8fd4;
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
          .recovery-grid {
            grid-template-columns: 1fr !important;
          }
        }
        input, textarea, select {
          color: var(--input-text) !important;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9d8fd4 !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
}
