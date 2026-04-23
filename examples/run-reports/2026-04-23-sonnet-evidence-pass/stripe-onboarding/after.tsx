"use client";

import React, { useMemo, useState } from "react";

type StepId = "business" | "identity" | "bank";
type AsyncState = "idle" | "loading" | "error";

type FormState = {
  businessName: string;
  legalName: string;
  businessType: string;
  country: string;
  website: string;
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  idType: string;
  idNumber: string;
  accountHolder: string;
  routingNumber: string;
  accountNumber: string;
};

const steps: { id: StepId; label: string; short: string }[] = [
  { id: "business", label: "Business info", short: "Business" },
  { id: "identity", label: "Identity verification", short: "Identity" },
  { id: "bank", label: "Bank account", short: "Bank" },
];

const inputBase =
  "block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition-[border-color,box-shadow,transform] duration-150 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5 active:scale-[0.998] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";
const labelBase = "mb-2 block text-sm font-medium text-slate-800";
const helperBase = "mt-2 text-xs leading-5 text-slate-500";
const cardBase =
  "rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] outline outline-1 outline-slate-950/[0.04]";

export default function Page() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [asyncState, setAsyncState] = useState<AsyncState>("idle");
  const [showEmptyIdentity, setShowEmptyIdentity] = useState(false);
  const [showBankConnectionError, setShowBankConnectionError] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormState>({
    businessName: "Northline Studio",
    legalName: "Northline Studio LLC",
    businessType: "llc",
    country: "United States",
    website: "northline.studio",
    email: "ops@northline.studio",
    firstName: "",
    lastName: "",
    dob: "",
    idType: "passport",
    idNumber: "",
    accountHolder: "",
    routingNumber: "",
    accountNumber: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const progress = ((currentStep + 1) / steps.length) * 100;
  const activeStep = steps[currentStep];

  const businessErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!form.businessName.trim()) errors.businessName = "Enter your public business name.";
    if (!form.legalName.trim()) errors.legalName = "Enter the legal entity name on official documents.";
    if (!form.businessType) errors.businessType = "Select a business type.";
    if (!form.country) errors.country = "Select your country or region.";
    if (!form.email.trim()) errors.email = "Enter a support email.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Enter a valid email address.";
    if (form.website && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.website.replace(/^https?:\/\//, ""))) {
      errors.website = "Enter a valid website like example.com.";
    }
    return errors;
  }, [form]);

  const identityErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (showEmptyIdentity) return errors;
    if (!form.firstName.trim()) errors.firstName = "Enter the representative's first name.";
    if (!form.lastName.trim()) errors.lastName = "Enter the representative's last name.";
    if (!form.dob.trim()) errors.dob = "Enter a date of birth.";
    if (!form.idType) errors.idType = "Choose an ID type.";
    if (!form.idNumber.trim()) errors.idNumber = "Enter the ID number exactly as shown on the document.";
    return errors;
  }, [form, showEmptyIdentity]);

  const bankErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (showBankConnectionError) return errors;
    if (!form.accountHolder.trim()) errors.accountHolder = "Enter the account holder name.";
    if (!/^\d{9}$/.test(form.routingNumber)) errors.routingNumber = "Routing number must be 9 digits.";
    if (!/^\d{4,17}$/.test(form.accountNumber)) errors.accountNumber = "Account number must be 4 to 17 digits.";
    return errors;
  }, [form, showBankConnectionError]);

  const currentErrors =
    activeStep.id === "business"
      ? businessErrors
      : activeStep.id === "identity"
      ? identityErrors
      : bankErrors;

  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const markTouched = (key: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const validateStep = () => {
    if (activeStep.id === "business") {
      setTouched((prev) => ({
        ...prev,
        businessName: true,
        legalName: true,
        businessType: true,
        country: true,
        website: true,
        email: true,
      }));
      return Object.keys(businessErrors).length === 0;
    }

    if (activeStep.id === "identity") {
      if (showEmptyIdentity) return true;
      setTouched((prev) => ({
        ...prev,
        firstName: true,
        lastName: true,
        dob: true,
        idType: true,
        idNumber: true,
      }));
      return Object.keys(identityErrors).length === 0;
    }

    if (showBankConnectionError) return true;
    setTouched((prev) => ({
      ...prev,
      accountHolder: true,
      routingNumber: true,
      accountNumber: true,
    }));
    return Object.keys(bankErrors).length === 0;
  };

  const primaryLabel =
    currentStep === 0 ? "Continue to identity verification" : currentStep === 1 ? "Continue to bank account" : "Finish setup";

  const handlePrimary = async () => {
    if (!validateStep()) return;

    setAsyncState("loading");
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (activeStep.id === "identity" && showEmptyIdentity) {
      setAsyncState("idle");
      setCurrentStep(2);
      return;
    }

    if (activeStep.id === "bank" && showBankConnectionError) {
      setAsyncState("error");
      return;
    }

    if (currentStep < steps.length - 1) {
      setAsyncState("idle");
      setCurrentStep((s) => s + 1);
      return;
    }

    setAsyncState("idle");
    setSubmitted(true);
  };

  const resetError = () => setAsyncState("idle");

  if (submitted) {
    return (
      <main className="min-h-screen bg-[linear-gradient(to_bottom,rgba(248,250,252,0.9),rgba(255,255,255,1))] text-slate-950 antialiased">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <section className={`${cardBase} w-full p-6 sm:p-8`}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 outline outline-1 outline-emerald-900/10">
                <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.312a1 1 0 0 1-1.417 0L3.29 9.227a1 1 0 1 1 1.42-1.405l4.042 4.085 6.543-6.605a1 1 0 0 1 1.409-.012Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500" style={{ textWrap: "balance" }}>
                  Account setup complete
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl" style={{ textWrap: "balance" }}>
                  You're ready to start accepting payments
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]" style={{ textWrap: "pretty" }}>
                  We&apos;ve saved your business details, verified the account representative, and added your payout bank account.
                  Your first payout will be sent on a 2-day rolling schedule once live charges begin processing.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-[transform,background-color,box-shadow] duration-150 hover:bg-slate-800 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-slate-950/10"
                  >
                    Open dashboard
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-[background-color,transform,border-color] duration-150 hover:bg-slate-50 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-slate-950/5"
                  >
                    Download account summary
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,rgba(248,250,252,0.98),rgba(255,255,255,1))] text-slate-950 antialiased">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <section className={`${cardBase} overflow-hidden`}>
            <header className="border-b border-slate-200/80 px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Payments onboarding</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[30px]" style={{ textWrap: "balance" }}>
                    Set up your account in three steps
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]" style={{ textWrap: "pretty" }}>
                    Add your business details, verify the account representative, and connect a bank account for payouts.
                  </p>
                </div>
                <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right sm:block">
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Estimated time</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">4–6 minutes</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <span className="text-sm font-medium text-slate-700">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-950 transition-[width] duration-300"
                    style={{ width: `${progress}%` }}
                    aria-hidden="true"
                  />
                </div>

                <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Onboarding progress">
                  {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isComplete = index < currentStep;
                    return (
                      <li
                        key={step.id}
                        className={`rounded-2xl px-4 py-3 outline outline-1 transition-[background-color,color,outline-color] duration-150 ${
                          isActive
                            ? "bg-slate-950 text-white outline-slate-950"
                            : isComplete
                            ? "bg-slate-50 text-slate-900 outline-slate-200"
                            : "bg-white text-slate-500 outline-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                              isActive
                                ? "bg-white/12 text-white outline outline-1 outline-white/15"
                                : isComplete
                                ? "bg-emerald-50 text-emerald-700 outline outline-1 outline-emerald-900/10"
                                : "bg-slate-50 text-slate-500 outline outline-1 outline-slate-200"
                            }`}
                            aria-hidden="true"
                          >
                            {isComplete ? "✓" : index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${isActive ? "text-white" : "text-slate-900"}`}>{step.label}</p>
                            <p className={`mt-0.5 text-xs ${isActive ? "text-white/70" : "text-slate-500"}`}>
                              {isComplete ? "Completed" : isActive ? "In progress" : "Up next"}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </header>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {asyncState === "error" && (
                <div
                  className="mb-6 rounded-2xl bg-rose-50 p-4 text-rose-900 outline outline-1 outline-rose-900/10"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">We couldn&apos;t connect this bank account</p>
                      <p className="mt-1 text-sm leading-6 text-rose-800" style={{ textWrap: "pretty" }}>
                        The routing details didn&apos;t pass validation with our bank partner. Check the numbers and try again, or use a different account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetError}
                      className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-800 transition-[background-color,transform] duration-150 hover:bg-rose-100 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-rose-900/10"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {activeStep.id === "business" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">Business details</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600" style={{ textWrap: "pretty" }}>
                      These details appear on statements, invoices, and support surfaces. Use the legal entity name exactly as it appears on registration documents.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label="Public business name"
                      htmlFor="businessName"
                      error={touched.businessName ? businessErrors.businessName : undefined}
                      helper="Shown to customers on receipts and payment pages."
                    >
                      <input
                        id="businessName"
                        name="businessName"
                        autoComplete="organization"
                        className={inputBase}
                        value={form.businessName}
                        onChange={(e) => updateField("businessName", e.target.value)}
                        onBlur={() => markTouched("businessName")}
                        aria-invalid={!!(touched.businessName && businessErrors.businessName)}
                        aria-describedby="businessName-help businessName-error"
                      />
                    </Field>

                    <Field
                      label="Legal entity name"
                      htmlFor="legalName"
                      error={touched.legalName ? businessErrors.legalName : undefined}
                      helper="Use the registered name on tax and banking records."
                    >
                      <input
                        id="legalName"
                        name="legalName"
                        autoComplete="organization"
                        className={inputBase}
                        value={form.legalName}
                        onChange={(e) => updateField("legalName", e.target.value)}
                        onBlur={() => markTouched("legalName")}
                        aria-invalid={!!(touched.legalName && businessErrors.legalName)}
                        aria-describedby="legalName-help legalName-error"
                      />
                    </Field>

                    <Field
                      label="Business type"
                      htmlFor="businessType"
                      error={touched.businessType ? businessErrors.businessType : undefined}
                    >
                      <select
                        id="businessType"
                        name="businessType"
                        className={inputBase}
                        value={form.businessType}
                        onChange={(e) => updateField("businessType", e.target.value)}
                        onBlur={() => markTouched("businessType")}
                        aria-invalid={!!(touched.businessType && businessErrors.businessType)}
                        aria-describedby="businessType-error"
                      >
                        <option value="">Select a type</option>
                        <option value="sole-prop">Sole proprietorship</option>
                        <option value="llc">Limited liability company</option>
                        <option value="corporation">Corporation</option>
                        <option value="nonprofit">Nonprofit</option>
                      </select>
                    </Field>

                    <Field
                      label="Country or region"
                      htmlFor="country"
                      error={touched.country ? businessErrors.country : undefined}
                    >
                      <select
                        id="country"
                        name="country"
                        className={inputBase}
                        value={form.country}
                        onChange={(e) => updateField("country", e.target.value)}
                        onBlur={() => markTouched("country")}
                        aria-invalid={!!(touched.country && businessErrors.country)}
                        aria-describedby="country-error"
                      >
                        <option value="">Select a country</option>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Australia</option>
                      </select>
                    </Field>

                    <Field
                      label="Website"
                      htmlFor="website"
                      error={touched.website ? businessErrors.website : undefined}
                      helper="Optional. Helps us review your business faster."
                    >
                      <input
                        id="website"
                        name="website"
                        autoComplete="url"
                        placeholder="example.com"
                        className={inputBase}
                        value={form.website}
                        onChange={(e) => updateField("website", e.target.value)}
                        onBlur={() => markTouched("website")}
                        aria-invalid={!!(touched.website && businessErrors.website)}
                        aria-describedby="website-help website-error"
                      />
                    </Field>

                    <Field
                      label="Support email"
                      htmlFor="email"
                      error={touched.email ? businessErrors.email : undefined}
                      helper="Used for account notices and customer support receipts."
                    >
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={inputBase}
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        onBlur={() => markTouched("email")}
                        aria-invalid={!!(touched.email && businessErrors.email)}
                        aria-describedby="email-help email-error"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {activeStep.id === "identity" && (
                <div className="space-y-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-950">Verify the account representative</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600" style={{ textWrap: "pretty" }}>
                        We verify one person who controls or owns the business. This helps prevent fraud and keeps payouts compliant.
                      </p>
                    </div>

                    <label className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-900"
                        checked={showEmptyIdentity}
                        onChange={(e) => setShowEmptyIdentity(e.target.checked)}
                      />
                      Show empty state
                    </label>
                  </div>

                  {showEmptyIdentity ? (
                    <div className="rounded-[20px] bg-slate-50 p-6 outline outline-1 outline-slate-200 sm:p-8">
                      <div className="max-w-xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 outline outline-1 outline-slate-200">
                          <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M10 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-6 14a6 6 0 1 1 12 0H4Z" />
                          </svg>
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-slate-950">No representative added yet</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600" style={{ textWrap: "pretty" }}>
                          Add the person who owns or controls this business. Their legal name, date of birth, and ID details are required before payouts can begin.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowEmptyIdentity(false)}
                          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-[transform,background-color] duration-150 hover:bg-slate-800 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-slate-950/10"
                        >
                          Add representative
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        label="First name"
                        htmlFor="firstName"
                        error={touched.firstName ? identityErrors.firstName : undefined}
                      >
                        <input
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                          className={inputBase}
                          value={form.firstName}
                          onChange={(e) => updateField("firstName", e.target.value)}
                          onBlur={() => markTouched("firstName")}
                          aria-invalid={!!(touched.firstName && identityErrors.firstName)}
                          aria-describedby="firstName-error"
                        />
                      </Field>

                      <Field
                        label="Last name"
                        htmlFor="lastName"
                        error={touched.lastName ? identityErrors.lastName : undefined}
                      >
                        <input
                          id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                          className={inputBase}
                          value={form.lastName}
                          onChange={(e) => updateField("lastName", e.target.value)}
                          onBlur={() => markTouched("lastName")}
                          aria-invalid={!!(touched.lastName && identityErrors.lastName)}
                          aria-describedby="lastName-error"
                        />
                      </Field>

                      <Field
                        label="Date of birth"
                        htmlFor="dob"
                        error={touched.dob ? identityErrors.dob : undefined}
                      >
                        <input
                          id="dob"
                          name="dob"
                          type="date"
                          className={inputBase}
                          value={form.dob}
                          onChange={(e) => updateField("dob", e.target.value)}
                          onBlur={() => markTouched("dob")}
                          aria-invalid={!!(touched.dob && identityErrors.dob)}
                          aria-describedby="dob-error"
                        />
                      </Field>

                      <Field
                        label="ID type"
                        htmlFor="idType"
                        error={touched.idType ? identityErrors.idType : undefined}
                      >
                        <select
                          id="idType"
                          name="idType"
                          className={inputBase}
                          value={form.idType}
                          onChange={(e) => updateField("idType", e.target.value)}
                          onBlur={() => markTouched("idType")}
                          aria-invalid={!!(touched.idType && identityErrors.idType)}
                          aria-describedby="idType-error"
                        >
                          <option value="">Select an ID type</option>
                          <option value="passport">Passport</option>
                          <option value="drivers-license">Driver&apos;s license</option>
                          <option value="national-id">National ID</option>
                        </select>
                      </Field>

                      <div className="sm:col-span-2">
                        <Field
                          label="ID number"
                          htmlFor="idNumber"
                          error={touched.idNumber ? identityErrors.idNumber : undefined}
                          helper="Enter the number exactly as shown on the selected document."
                        >
                          <input
                            id="idNumber"
                            name="idNumber"
                            className={inputBase}
                            value={form.idNumber}
                            onChange={(e) => updateField("idNumber", e.target.value)}
                            onBlur={() => markTouched("idNumber")}
                            aria-invalid={!!(touched.idNumber && identityErrors.idNumber)}
                            aria-describedby="idNumber-help idNumber-error"
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeStep.id === "bank" && (
                <div className="space-y-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-slate-950">Add a payout bank account</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600" style={{ textWrap: "pretty" }}>
                        Payouts will be sent to this account on your configured schedule. Use a business checking account whenever possible.
                      </p>
                    </div>

                    <label className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-900"
                        checked={showBankConnectionError}
                        onChange={(e) => {
                          setShowBankConnectionError(e.target.checked);
                          setAsyncState("idle");
                        }}
                      />
                      Simulate bank error
                    </label>
                  </div>

                  {asyncState === "loading" ? (
                    <div className="space-y-5" aria-live="polite" aria-busy="true">
                      <SkeletonBlock className="h-5 w-40" />
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <SkeletonField />
                        <SkeletonField />
                        <div className="sm:col-span-2">
                          <SkeletonField />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field
                        label="Account holder name"
                        htmlFor="accountHolder"
                        error={touched.accountHolder ? bankErrors.accountHolder : undefined}
                      >
                        <input
                          id="accountHolder"
                          name="accountHolder"
                          autoComplete="name"
                          className={inputBase}
                          value={form.accountHolder}
                          onChange={(e) => updateField("accountHolder", e.target.value)}
                          onBlur={() => markTouched("accountHolder")}
                          aria-invalid={!!(touched.accountHolder && bankErrors.accountHolder)}
                          aria-describedby="accountHolder-error"
                        />
                      </Field>

                      <Field
                        label="Routing number"
                        htmlFor="routingNumber"
                        error={touched.routingNumber ? bankErrors.routingNumber : undefined}
                        helper="9 digits for US bank accounts."
                      >
                        <input
                          id="routingNumber"
                          name="routingNumber"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className={inputBase}
                          value={form.routingNumber}
                          onChange={(e) => updateField("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))}
                          onBlur={() => markTouched("routingNumber")}
                          aria-invalid={!!(touched.routingNumber && bankErrors.routingNumber)}
                          aria-describedby="routingNumber-help routingNumber-error"
                        />
                      </Field>

                      <div className="sm:col-span-2">
                        <Field
                          label="Account number"
                          htmlFor="accountNumber"
                          error={touched.accountNumber ? bankErrors.accountNumber : undefined}
                          helper="We encrypt bank details in transit and at rest."
                        >
                          <input
                            id="accountNumber"
                            name="accountNumber"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={inputBase}
                            value={form.accountNumber}
                            onChange={(e) => updateField("accountNumber", e.target.value.replace(/\D/g, "").slice(0, 17))}
                            onBlur={() => markTouched("accountNumber")}
                            aria-invalid={!!(touched.accountNumber && bankErrors.accountNumber)}
                            aria-describedby="accountNumber-help accountNumber-error"
                          />
                        </Field>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="border-t border-slate-200/80 px-5 py-4 sm:px-8 sm:py-5">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {currentStep === 0 ? "Your payout schedule will appear after setup." : currentStep === 1 ? "Verification usually completes within a few minutes." : "Payouts typically arrive in 2 business days."}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setAsyncState("idle");
                        setCurrentStep((s) => Math.max(0, s - 1));
                      }}
                      className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-[background-color,transform,border-color] duration-150 hover:bg-slate-50 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-slate-950/5"
                    >
                      Back
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handlePrimary}
                    disabled={asyncState === "loading"}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-[transform,background-color,box-shadow] duration-150 hover:bg-slate-800 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-slate-950/10 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {asyncState === "loading" ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                          <path d="M17 10a7 7 0 0 0-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Saving…
                      </span>
                    ) : (
                      primaryLabel
                    )}
                  </button>
                </div>
              </div>
            </footer>
          </section>

          <aside className="space-y-6">
            <section className={`${cardBase} p-5 sm:p-6`}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">What we review</h2>
              <ul className="mt-4 space-y-4">
                <ChecklistItem
                  title="Business profile"
                  text="Public-facing details, support email, and legal entity information."
                  done={currentStep > 0}
                />
                <ChecklistItem
                  title="Representative identity"
                  text="Name, birth date, and government-issued identification."
                  done={currentStep > 1}
                />
                <ChecklistItem
                  title="Payout account"
                  text="A verified bank account for settlements and refunds."
                  done={false}
                  active={currentStep === 2}
                />
              </ul>
            </section>

            <section className={`${cardBase} p-5 sm:p-6`}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Need help?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600" style={{ textWrap: "pretty" }}>
                If you&apos;re setting up a marketplace, nonprofit, or regulated business, additional verification might be required after this flow.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-slate-950/5"
                >
                  Read onboarding guide
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.97] focus:outline-none focus:ring-4 focus:ring-slate-950/5"
                >
                  Contact support
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  error,
  helper,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelBase}>
        {label}
      </label>
      {children}
      {helper ? (
        <p id={`${htmlFor}-help`} className={helperBase} style={{ textWrap: "pretty" }}>
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-xs font-medium leading-5 text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ChecklistItem({
  title,
  text,
  done,
  active,
}: {
  title: string;
  text: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold outline outline-1 ${
          done
            ? "bg-emerald-50 text-emerald-700 outline-emerald-900/10"
            : active
            ? "bg-slate-950 text-white outline-slate-950"
            : "bg-slate-50 text-slate-400 outline-slate-200"
        }`}
        aria-hidden="true"
      >
        {done ? "✓" : active ? "•" : ""}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600" style={{ textWrap: "pretty" }}>
          {text}
        </p>
      </div>
    </li>
  );
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

function SkeletonField() {
  return (
    <div className="space-y-2">
      <SkeletonBlock className="h-4 w-28" />
      <SkeletonBlock className="h-12 w-full rounded-xl" />
      <SkeletonBlock className="h-3 w-32" />
    </div>
  );
}
