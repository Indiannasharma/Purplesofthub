'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    bg: 'rgba(24,119,242,0.1)',
    border: 'rgba(24,119,242,0.3)',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.1)',
    border: 'rgba(225,48,108,0.3)',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#010101',
    bg: 'rgba(0,0,0,0.08)',
    border: 'rgba(0,0,0,0.2)',
  },
]

const FACEBOOK_PRICE_NGN = 42000
const FACEBOOK_PRICE_USD = 30
const INSTAGRAM_PRICE_NGN = 75000
const INSTAGRAM_PRICE_USD = 50

export default function AccountRecoveryPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('facebook')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
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

  const updateForm = (field: string, value: string | File | null) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      updateForm('idFile', file)
      updateForm('idFileName', file.name)
    }
  }

  const isFormValid = () => {
    return (
      form.fullName &&
      form.facebookHandle &&
      form.firstName &&
      form.surname &&
      form.email &&
      form.phone &&
      form.supportType &&
      form.additionalInfo &&
      form.idFile &&
      agreed
    )
  }

  const handleSubmitAndPay = async () => {
    if (!isFormValid()) {
      setSubmitError('Please fill all fields, upload ID and agree to terms')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      // Save form data first
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value && key !== 'idFile') {
          formData.append(key, value as string)
        }
      })
      if (form.idFile) {
        formData.append('idFile', form.idFile)
      }
      formData.append('platform', activeTab)
      const amount = activeTab === 'facebook' ? FACEBOOK_PRICE_NGN : INSTAGRAM_PRICE_NGN
      formData.append('amount', String(amount))

      // Save to API
      await fetch('/api/account-recovery', {
        method: 'POST',
        body: formData,
      })

      // Initialize Paystack payment
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          amount: activeTab === 'facebook' ? FACEBOOK_PRICE_NGN : INSTAGRAM_PRICE_NGN,
          currency: 'NGN',
          metadata: {
            service: 'account-recovery',
            platform: activeTab,
            fullName: form.fullName,
            phone: form.phone,
          },
          callback_url: `${window.location.origin}/services/social-media-management/account-recovery/success`,
        }),
      })

      const data = await res.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        setSubmitError(data.error || 'Payment initialization failed')
      }
    } catch (err) {
      setSubmitError('Something went wrong. Please try again.')
    }

    setSubmitting(false)
  }

  const activePlatform = PLATFORMS.find(p => p.id === activeTab)!

  return (
    <>
      {/* Page header */}
      <div className="recovery-page-header">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(124,58,237,0.1)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '100px',
            padding: '6px 16px',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '13px', color: '#a855f7', fontWeight: 600 }}>
              🔐 Digital Marketing Services
            </span>
          </div>
          <h1 className="recovery-heading" style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 900,
            margin: '0 0 16px',
            lineHeight: 1.1,
            letterSpacing: '-0.5px',
          }}>
            Social Media{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Account Recovery
            </span>
          </h1>
          <p className="recovery-subtext" style={{
            fontSize: '17px',
            margin: '0 0 24px',
            lineHeight: 1.6,
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Professional account recovery service for hacked or disabled social media accounts. Fast, secure and reliable.
          </p>
          {/* Price badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}>
            <div style={{
              background: 'rgba(24,119,242,0.15)',
              border: '1px solid rgba(24,119,242,0.3)',
              borderRadius: '100px',
              padding: '8px 20px',
              color: '#60a5fa',
              fontSize: '14px',
              fontWeight: 700,
            }}>
              📘 Facebook — ₦42,000 / $30
            </div>
            <div style={{
              background: 'rgba(225,48,108,0.15)',
              border: '1px solid rgba(225,48,108,0.3)',
              borderRadius: '100px',
              padding: '8px 20px',
              color: '#f472b6',
              fontSize: '14px',
              fontWeight: 700,
            }}>
              📸 Instagram — ₦75,000 / $50
            </div>
            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '100px',
              padding: '8px 20px',
              color: '#f59e0b',
              fontSize: '13px',
              fontWeight: 600,
            }}>
              ⏱ 14–30 Business Days
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 16px',
        display: 'flex',
        gap: '28px',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
      }}>
        {/* ── LEFT SIDEBAR ── */}
        <div style={{
          width: '220px',
          flexShrink: 0,
          position: 'sticky',
          top: '80px',
        }}
        className="account-recovery-sidebar">
          <p style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
            paddingLeft: '4px',
          }}>
            Select Platform
          </p>
          {PLATFORMS.map(platform => (
            <button
              key={platform.id}
              onClick={() => {
                setActiveTab(platform.id)
                setForm({
                  fullName: '',
                  facebookHandle: '',
                  firstName: '',
                  surname: '',
                  email: '',
                  phone: '',
                  supportType: '',
                  additionalInfo: '',
                  idFile: null,
                  idFileName: '',
                })
                setAgreed(false)
                setSubmitError('')
              }}
              className="recovery-sidebar-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                marginBottom: '8px',
                border: activeTab === platform.id
                  ? `2px solid ${platform.color}`
                  : '2px solid rgba(124,58,237,0.1)',
                background: activeTab === platform.id
                  ? platform.bg
                  : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '24px' }}>
                {platform.icon}
              </span>
              <span style={{
                fontSize: '14px',
                fontWeight: activeTab === platform.id ? 700 : 500,
                color: activeTab === platform.id
                  ? platform.color
                  : '#9d8fd4',
              }}>
                {platform.name}
              </span>
              {activeTab === platform.id && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '10px',
                  color: platform.color,
                }}>●</span>
              )}
            </button>
          ))}

          {/* Info box */}
          <div style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '20px',
          }}>
            <p style={{
              fontSize: '12px',
              fontWeight: 700,
              margin: '0 0 8px',
            }}>
              ℹ️ Important
            </p>
            <ul style={{
              fontSize: '12px',
              margin: 0,
              paddingLeft: '16px',
              lineHeight: 1.8,
            }}>
              <li>14–30 business days</li>
              <li>Non-refundable</li>
              <li>Valid ID required</li>
              <li>Secure & confidential</li>
            </ul>
          </div>
        </div>

          {/* ── MAIN CONTENT ── */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {/* Platform header */}
          <div className="recovery-card" style={{
            border: `1px solid ${activePlatform.border}`,
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: activePlatform.bg,
              border: `1px solid ${activePlatform.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              flexShrink: 0,
            }}>
              {activePlatform.icon}
            </div>
            <div>
              <h2 className="recovery-heading" style={{
                fontSize: '20px',
                fontWeight: 800,
                margin: '0 0 4px',
              }}>
                {activePlatform.name} Account Recovery
              </h2>
              <p className="recovery-subtext" style={{
                fontSize: '13px',
                margin: 0,
              }}>
                Professional recovery service for your {activePlatform.name} account
              </p>
            </div>
          </div>

          {/* ── FACEBOOK TAB ── */}
          {activeTab === 'facebook' && (
            <div>
              {/* Service description */}
              <div style={{
                background: 'rgba(24,119,242,0.06)',
                border: '1px solid rgba(24,119,242,0.2)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}>
                <h3 className="recovery-heading" style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: '0 0 12px',
                }}>
                  📘 Facebook Account Recovery Service
                </h3>
                <p className="recovery-subtext" style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  margin: '0 0 12px',
                }}>
                  Our expert team specialises in recovering Facebook accounts that have been hacked, disabled, or locked. We work directly with Facebook's support systems to restore access to your account.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginTop: '16px',
                }}>
                  {[
                    '✅ Hacked account recovery',
                    '✅ Disabled account appeal',
                    '✅ Identity verification support',
                    '✅ Account access restoration',
                    '✅ Two-factor auth issues',
                    '✅ Suspicious login recovery',
                  ].map(item => (
                    <div key={item} className="recovery-subtext" style={{
                      fontSize: '13px',
                    }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Form */}
              <div className="recovery-card" style={{
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '24px',
              }}>
                <h3 className="recovery-heading" style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  margin: '0 0 6px',
                }}>
                  Support Form
                </h3>
                <p className="recovery-subtext" style={{
                  fontSize: '13px',
                  margin: '0 0 24px',
                }}>
                  Please fill in all fields accurately. Incorrect information may delay your recovery.
                </p>
                <div style={{ display: 'grid', gap: '18px' }}>
                  {/* Full Name */}
                  <div>
                    <label className="recovery-label">Full Name *</label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => updateForm('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className="recovery-input"
                      onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)' }}
                    />
                  </div>

                  {/* Facebook Handle */}
                  <div>
                    <label className="recovery-label">What is your Facebook Handle? *</label>
                    <input
                      type="text"
                      value={form.facebookHandle}
                      onChange={e => updateForm('facebookHandle', e.target.value)}
                      placeholder="e.g. facebook.com/yourhandle or @yourname"
                      className="recovery-input"
                      onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)' }}
                    />
                  </div>

                  {/* First Name + Surname */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '14px',
                  }}>
                    <div>
                      <label className="recovery-label">First Name *</label>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={e => updateForm('firstName', e.target.value)}
                        placeholder="First name"
                        className="recovery-input"
                        onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)' }}
                      />
                    </div>
                    <div>
                      <label className="recovery-label">Surname *</label>
                      <input
                        type="text"
                        value={form.surname}
                        onChange={e => updateForm('surname', e.target.value)}
                        placeholder="Surname"
                        className="recovery-input"
                        onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="recovery-label">What is your Email Address? *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => updateForm('email', e.target.value)}
                      placeholder="your@email.com"
                      className="recovery-input"
                      onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)' }}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="recovery-label">What is your Preferred Phone Number? *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => updateForm('phone', e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="recovery-input"
                      onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)' }}
                    />
                  </div>

                  {/* Support Type Dropdown */}
                  <div>
                    <label className="recovery-label">What do you need support with? *</label>
                    <select
                      value={form.supportType}
                      onChange={e => updateForm('supportType', e.target.value)}
                      className="recovery-input"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">— Select an option —</option>
                      <option value="hacked">Account Hacked</option>
                      <option value="disabled">Disabled Account</option>
                    </select>
                  </div>

                  {/* ID Upload */}
                  <div>
                    <label className="recovery-label">Upload Means of Identification *</label>
                    <p className="recovery-subtext" style={{
                      fontSize: '12px',
                      margin: '0 0 8px',
                    }}>
                      Accepted: Digital NIN, International Passport, National ID Card, Driver's License
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      style={{
                        width: '100%',
                        border: '2px dashed rgba(124,58,237,0.3)',
                        borderRadius: '12px',
                        padding: '20px',
                        background: form.idFileName ? 'rgba(124,58,237,0.08)' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {form.idFileName ? (
                        <div>
                          <p style={{ fontSize: '20px', margin: '0 0 6px' }}>✅</p>
                          <p style={{ fontSize: '13px', color: '#a855f7', fontWeight: 600, margin: 0 }}>
                            {form.idFileName}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b5fa0', margin: '4px 0 0' }}>
                            Click to change file
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '28px', margin: '0 0 8px' }}>📎</p>
                          <p style={{ fontSize: '14px', color: '#9d8fd4', fontWeight: 600, margin: '0 0 4px' }}>
                            Click to upload your ID
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b5fa0', margin: 0 }}>
                            JPG, PNG or PDF — Max 5MB
                          </p>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <label className="recovery-label">Please provide additional information regarding the issue *</label>
                    <textarea
                      value={form.additionalInfo}
                      onChange={e => updateForm('additionalInfo', e.target.value)}
                      placeholder="Describe when you lost access, what happened, any relevant details that could help us recover your account..."
                      rows={5}
                      className="recovery-input"
                      style={{ resize: 'vertical', minHeight: '120px' }}
                      onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(124,58,237,0.2)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="recovery-card" style={{
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
              }}>
                <h3 className="recovery-heading" style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  margin: '0 0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  📋 Terms & Conditions
                </h3>
                <div className="recovery-terms-box">
                  <p style={{ fontWeight: 700, color: '#c084fc', margin: '0 0 8px' }}>
                    Account Recovery Service — Terms & Conditions
                  </p>
                  <p>
                    <strong style={{ color: '#fff' }}>1. Service Timeline:</strong> Account recovery takes between <strong style={{ color: '#f59e0b' }}>14 to 30 business days</strong> from the date of successful payment and submission of all required documents. Timelines may vary depending on platform response times which are beyond our control.
                  </p>
                  <br />
                  <p>
                    <strong style={{ color: '#fff' }}>2. Non-Refundable Policy:</strong> <strong style={{ color: '#ef4444' }}>ALL PAYMENTS ARE STRICTLY NON-REFUNDABLE.</strong> By making payment you acknowledge that you are paying for our professional services and time regardless of the outcome. Social media platforms have their own policies and final decisions which PurpleSoftHub cannot override or guarantee.
                  </p>
                  <br />
                  <p>
                    <strong style={{ color: '#fff' }}>3. No Guarantee of Recovery:</strong> While we have a high success rate, PurpleSoftHub cannot guarantee 100% account recovery in all cases. Final decisions rest with the social media platform (Facebook, Instagram, TikTok).
                  </p>
                  <br />
                  <p>
                    <strong style={{ color: '#fff' }}>4. Accurate Information:</strong> You must provide accurate and truthful information. Any false information provided may result in failure of recovery and forfeiture of payment without refund.
                  </p>
                  <br />
                  <p>
                    <strong style={{ color: '#fff' }}>5. Identity Verification:</strong> A valid government-issued ID (NIN, Passport, National ID, Driver's License) is required. Your ID is used solely for account verification purposes and is handled with strict confidentiality.
                  </p>
                  <br />
                  <p>
                    <strong style={{ color: '#fff' }}>6. Privacy:</strong> All personal information provided is kept strictly confidential and is only used for the purpose of account recovery. We do not share your information with third parties.
                  </p>
                  <br />
                  <p>
                    <strong style={{ color: '#fff' }}>7. Communication:</strong> You will receive regular updates via email and WhatsApp throughout the recovery process. Please ensure your contact details are accurate.
                  </p>
                  <br />
                  <p>
                    <strong style={{ color: '#fff' }}>8. Payment:</strong> Service fee is <strong style={{ color: '#a855f7' }}>₦42,000 NGN / $30 USD</strong> per account recovery attempt. Payment is processed securely via Paystack.
                  </p>
                  <br />
                  <p style={{ fontWeight: 700, color: '#ef4444' }}>
                    ⚠️ IMPORTANT: By proceeding with payment you confirm that you have read, understood and agreed to all terms and conditions above. Payment is NON-REFUNDABLE under any circumstances.
                  </p>
                </div>

                {/* Agreement checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginTop: '2px',
                      accentColor: '#7c3aed',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <span className="recovery-subtext" style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                  }}>
                    I have read and agree to the <strong style={{ color: '#a855f7' }}>Terms & Conditions</strong> and <strong style={{ color: '#a855f7' }}>Privacy Policy</strong>. I understand that payment is <strong style={{ color: '#ef4444' }}>NON-REFUNDABLE</strong> and recovery takes <strong style={{ color: '#f59e0b' }}>14–30 business days</strong>.
                  </span>
                </label>
              </div>

              {/* Error message */}
              {submitError && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#f87171',
                }}>
                  ⚠️ {submitError}
                </div>
              )}

              {/* Payment button */}
              <button
                onClick={handleSubmitAndPay}
                disabled={submitting || !isFormValid()}
                style={{
                  width: '100%',
                  background: isFormValid()
                    ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                    : 'rgba(124,58,237,0.3)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '18px 24px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: isFormValid() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s',
                  boxShadow: isFormValid() ? '0 8px 30px rgba(124,58,237,0.4)' : 'none',
                }}
              >
                {submitting ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    Processing...
                  </>
                ) : (
                  <>
                    🔐 Submit & Pay ₦{FACEBOOK_PRICE_NGN.toLocaleString()} / ${FACEBOOK_PRICE_USD}
                  </>
                )}
              </button>
              <p className="recovery-subtext" style={{
                textAlign: 'center',
                fontSize: '12px',
                margin: '12px 0 0',
              }}>
                🔒 Secured by Paystack · Payment is non-refundable · 14–30 business days
              </p>
            </div>
          )}

          {/* ── INSTAGRAM TAB ── */}
          {activeTab === 'instagram' && (
            <div>
              <div style={{
                background: 'rgba(225,48,108,0.06)',
                border: '1px solid rgba(225,48,108,0.2)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '24px',
              }}>
                <h3 className="recovery-heading" style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 12px',
                }}>
                  📸 Instagram Account Recovery
                </h3>
                <p className="recovery-subtext" style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  margin: '0 0 20px',
                }}>
                  We help recover Instagram accounts that have been hacked, disabled or locked. Our team works through official Meta channels to restore your account access.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  marginBottom: '20px',
                }}>
                  {[
                    '✅ Hacked account recovery',
                    '✅ Disabled account appeal',
                    '✅ Impersonation reports',
                    '✅ Login verification issues',
                    '✅ Email/phone change recovery',
                    '✅ Two-factor auth recovery',
                  ].map(item => (
                    <div key={item} className="recovery-subtext" style={{ fontSize: '13px' }}>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#f59e0b',
                      margin: '0 0 4px',
                    }}>
                      Contact Us to Get Started
                    </p>
                    <p className="recovery-subtext" style={{
                      fontSize: '13px',
                      margin: 0,
                    }}>
                      Instagram recovery form is available via WhatsApp. Chat with us to begin your recovery process.
                    </p>
                  </div>
                </div>
              </div>
              <div className="recovery-card" style={{
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#a855f7',
                  margin: '0 0 4px',
                }}>
                  ₦{INSTAGRAM_PRICE_NGN.toLocaleString()}
                </p>
                <p className="recovery-subtext" style={{
                  fontSize: '15px',
                  margin: '0 0 20px',
                }}>
                  ${INSTAGRAM_PRICE_USD} USD · Non-refundable · 14–30 business days
                </p>
                <Link
                  href="https://wa.me/message/BPNJE7CPON3OJ1"
                  target="_blank"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#25D366',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Start Instagram Recovery
                </Link>
              </div>
            </div>
          )}

          {/* ── TIKTOK TAB ── */}
          {activeTab === 'tiktok' && (
            <div>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '24px',
              }}>
                <h3 className="recovery-heading" style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  margin: '0 0 12px',
                }}>
                  🎵 TikTok Account Recovery
                </h3>
                <p className="recovery-subtext" style={{
                  fontSize: '14px',
                  lineHeight: 1.7,
                  margin: '0 0 20px',
                }}>
                  Lost access to your TikTok account? Our team specialises in recovering TikTok accounts that have been hacked, banned or permanently suspended.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  marginBottom: '20px',
                }}>
                  {[
                    '✅ Hacked account recovery',
                    '✅ Banned account appeal',
                    '✅ Permanently suspended accounts',
                    '✅ Login access issues',
                    '✅ Phone/email recovery',
                    '✅ Creator account restoration',
                  ].map(item => (
                    <div key={item} className="recovery-subtext" style={{ fontSize: '13px' }}>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#f59e0b',
                      margin: '0 0 4px',
                    }}>
                      Contact Us to Get Started
                    </p>
                    <p className="recovery-subtext" style={{
                      fontSize: '13px',
                      margin: 0,
                    }}>
                      TikTok recovery is handled via WhatsApp consultation. Message us to begin.
                    </p>
                  </div>
                </div>
              </div>
              <div className="recovery-card" style={{
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '16px',
                padding: '28px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#a855f7',
                  margin: '0 0 4px',
                }}>
                  ₦{FACEBOOK_PRICE_NGN.toLocaleString()}
                </p>
                <p className="recovery-subtext" style={{
                  fontSize: '15px',
                  margin: '0 0 20px',
                }}>
                  ${FACEBOOK_PRICE_USD} USD · Non-refundable · 14–30 business days
                </p>
                <Link
                  href="https://wa.me/message/BPNJE7CPON3OJ1"
                  target="_blank"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#25D366',
                    color: '#fff',
                    padding: '14px 32px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Start TikTok Recovery
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .account-recovery-sidebar {
            width: 100% !important;
            position: static !important;
            display: flex !important;
            gap: 8px !important;
            overflow-x: auto !important;
            padding-bottom: 8px !important;
          }
          .account-recovery-sidebar > p {
            display: none !important;
          }
          .account-recovery-sidebar > div {
            display: none !important;
          }
        }
        /* Fix form text visibility */
        input:not([type="checkbox"])
        :not([type="radio"])
        :not([type="range"])
        :not([type="submit"])
        :not([type="button"]),
        textarea,
        select {
          color: #1a1a1a !important;
        }

        .dark input:not([type="checkbox"])
        :not([type="radio"])
        :not([type="range"]),
        .dark textarea,
        .dark select {
          color: #ffffff !important;
        }

        input::placeholder,
        textarea::placeholder {
          color: #9d8fd4 !important;
          opacity: 1 !important;
        }

        .dark input::placeholder,
        .dark textarea::placeholder {
          color: #6b5fa0 !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  )
}

// Shared styles
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(124,58,237,0.06)',
  border: '1px solid rgba(124,58,237,0.2)',
  borderRadius: '10px',
  padding: '12px 14px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}
