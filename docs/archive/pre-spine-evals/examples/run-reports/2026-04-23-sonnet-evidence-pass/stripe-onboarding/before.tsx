'use client'

import { useMemo, useState } from 'react'

export default function PaymentsOnboardingPage() {
  const [step, setStep] = useState(1)

  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    legalName: '',
    businessType: 'llc',
    country: 'United States',
    website: '',
  })

  const [identityInfo, setIdentityInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
  })

  const [bankInfo, setBankInfo] = useState({
    accountHolder: '',
    routingNumber: '',
    accountNumber: '',
  })

  const totalSteps = 3
  const progress = useMemo(() => (step / totalSteps) * 100, [step])

  const stepLabels = [
    { id: 1, title: 'Business info', subtitle: 'Tell us about your company' },
    { id: 2, title: 'Identity verification', subtitle: 'Verify the account owner' },
    { id: 3, title: 'Bank account', subtitle: 'Add payouts destination' },
  ]

  const nextStep = () => setStep((s) => Math.min(totalSteps, s + 1))
  const prevStep = () => setStep((s) => Math.max(1, s - 1))

  const isStepOneValid =
    businessInfo.businessName &&
    businessInfo.legalName &&
    businessInfo.businessType &&
    businessInfo.country &&
    businessInfo.website

  const isStepTwoValid =
    identityInfo.firstName &&
    identityInfo.lastName &&
    identityInfo.dateOfBirth &&
    identityInfo.email &&
    identityInfo.phone

  const isStepThreeValid =
    bankInfo.accountHolder &&
    bankInfo.routingNumber &&
    bankInfo.accountNumber

  const canContinue =
    (step === 1 && isStepOneValid) ||
    (step === 2 && isStepTwoValid) ||
    (step === 3 && isStepThreeValid)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">Payments onboarding</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Set up your account
                </h1>
              </div>
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
                Step {step} of {totalSteps}
              </div>
            </div>

            <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-slate-900 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {stepLabels.map((item) => {
                const active = item.id === step
                const complete = item.id < step

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition ${
                      active
                        ? 'border-slate-900 bg-white shadow-sm'
                        : complete
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-white/70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                          complete
                            ? 'bg-emerald-600 text-white'
                            : active
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {complete ? '✓' : item.id}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            active || complete ? 'text-slate-900' : 'text-slate-500'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            {step === 1 && (
              <div className="p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold">Business information</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    We use this to configure your payments profile and compliance settings.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business name
                    </label>
                    <input
                      type="text"
                      value={businessInfo.businessName}
                      onChange={(e) =>
                        setBusinessInfo({ ...businessInfo, businessName: e.target.value })
                      }
                      placeholder="Acme Studio"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Legal business name
                    </label>
                    <input
                      type="text"
                      value={businessInfo.legalName}
                      onChange={(e) =>
                        setBusinessInfo({ ...businessInfo, legalName: e.target.value })
                      }
                      placeholder="Acme Studio LLC"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business type
                    </label>
                    <select
                      value={businessInfo.businessType}
                      onChange={(e) =>
                        setBusinessInfo({ ...businessInfo, businessType: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    >
                      <option value="llc">LLC</option>
                      <option value="corporation">Corporation</option>
                      <option value="sole-proprietor">Sole proprietor</option>
                      <option value="partnership">Partnership</option>
                      <option value="nonprofit">Nonprofit</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Country
                    </label>
                    <select
                      value={businessInfo.country}
                      onChange={(e) =>
                        setBusinessInfo({ ...businessInfo, country: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>Germany</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Business website
                    </label>
                    <input
                      type="url"
                      value={businessInfo.website}
                      onChange={(e) =>
                        setBusinessInfo({ ...businessInfo, website: e.target.value })
                      }
                      placeholder="https://acme.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold">Identity verification</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Confirm the person responsible for this account to enable live payments and
                    payouts.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      First name
                    </label>
                    <input
                      type="text"
                      value={identityInfo.firstName}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, firstName: e.target.value })
                      }
                      placeholder="Jordan"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={identityInfo.lastName}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, lastName: e.target.value })
                      }
                      placeholder="Lee"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      value={identityInfo.dateOfBirth}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, dateOfBirth: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={identityInfo.email}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, email: e.target.value })
                      }
                      placeholder="jordan@acme.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={identityInfo.phone}
                      onChange={(e) =>
                        setIdentityInfo({ ...identityInfo, phone: e.target.value })
                      }
                      placeholder="+1 (555) 123-4567"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="p-6 sm:p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold">Bank account</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Add the bank account where you want to receive payouts.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Account holder name
                    </label>
                    <input
                      type="text"
                      value={bankInfo.accountHolder}
                      onChange={(e) =>
                        setBankInfo({ ...bankInfo, accountHolder: e.target.value })
                      }
                      placeholder="Acme Studio LLC"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Routing number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={bankInfo.routingNumber}
                      onChange={(e) =>
                        setBankInfo({ ...bankInfo, routingNumber: e.target.value })
                      }
                      placeholder="110000000"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Account number
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      value={bankInfo.accountNumber}
                      onChange={(e) =>
                        setBankInfo({ ...bankInfo, accountNumber: e.target.value })
                      }
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    Your banking details are encrypted and used only for payouts and account
                    verification.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={nextStep}
                disabled={!canContinue || step === totalSteps}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {step === 1 && 'Continue to identity verification'}
                {step === 2 && 'Continue to bank account'}
                {step === 3 && 'Finish setup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
