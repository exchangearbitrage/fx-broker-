"use client";

import Link from "next/link";
import { useState } from "react";
import {
  User,
  Lock,
  Shield,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Key,
  Globe,
  Bell,
  LogOut,
  Save,
} from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useCurrency } from "@/context/CurrencyContext";
import { useTranslation } from "@/context/LanguageContext";

interface UserSettingsViewProps {
  initialUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
    address?: string;
    timezone?: string;
    twoFactorEnabled?: boolean;
    role: string;
    kycStatus?: string;
    kycSubmissionCount?: number;
  };
  defaultTab?: string;
}

export function UserSettingsView({ initialUser, defaultTab = "profile" }: UserSettingsViewProps) {
  const { currency, setCurrency, supportedCurrencies, formatMoney } = useCurrency();
  const { language, setLanguage, languageNames } = useTranslation();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [user, setUser] = useState(initialUser);

  const kycApproved = user.kycStatus === "APPROVED";
  const kycRejected = user.kycStatus === "REJECTED";
  const kycSubmitted = (user.kycSubmissionCount ?? 0) > 0;

  // Profile Form state
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [country, setCountry] = useState(user.country || "");
  const [address, setAddress] = useState(user.address || "");
  const [timezone, setTimezone] = useState(user.timezone || "UTC");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2FA state
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled ?? false);

  // Trading preferences state
  const [defaultLeverage, setDefaultLeverage] = useState("50");
  const [slippage, setSlippage] = useState("0.5");
  const [oneClickTrading, setOneClickTrading] = useState(true);
  const [marginAlert, setMarginAlert] = useState("80");

  // Notifications
  const [emailFills, setEmailFills] = useState(true);
  const [emailMarginCalls, setEmailMarginCalls] = useState(true);
  const [emailWithdrawals, setEmailWithdrawals] = useState(true);

  // Status feedback
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          country,
          address,
          timezone,
          newEmail: email !== user.email ? email : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setUser((prev) => ({ ...prev, firstName, lastName, email, phone, country, address, timezone }));
      setStatusMessage({ type: "success", text: "Profile details updated successfully." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save changes." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setStatusMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setStatusMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to change password." });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle2FA() {
    const nextState = !twoFactor;
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactorEnabled: nextState }),
      });
      if (res.ok) {
        setTwoFactor(nextState);
        setStatusMessage({
          type: "success",
          text: nextState ? "Two-factor authentication enabled." : "Two-factor authentication disabled.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleTerminateSessions() {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terminateOtherSessions: true }),
      });
      if (res.ok) {
        setStatusMessage({ type: "success", text: "All other active sessions have been invalidated." });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function saveDisplayPreference(kind: "currency" | "language", value: string) {
    if (kind === "currency") setCurrency(value); else setLanguage(value);
    setStatusMessage({ type: "success", text: "Language and currency preference saved." });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-primary">Account Management</p>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">Settings & Security</h1>
        <p className="text-xs text-brand-secondary mt-1">
          Manage your account profile, authentication security, trading preferences, and notification thresholds.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab("profile");
            setStatusMessage(null);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "profile"
              ? "bg-brand-primary text-black font-bold shadow-sm"
              : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("security");
            setStatusMessage(null);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "security"
              ? "bg-brand-primary text-black font-bold shadow-sm"
              : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("preferences");
            setStatusMessage(null);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "preferences"
              ? "bg-brand-primary text-black font-bold shadow-sm"
              : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Trading Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("kyc");
            setStatusMessage(null);
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "kyc"
              ? "bg-brand-primary text-black font-bold shadow-sm"
              : "border border-white/10 bg-white/5 text-brand-secondary hover:text-white"
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Verification & Tiers</span>
        </button>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-400"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* ── TAB 1: PROFILE DETAILS ────────────────────────────────────────── */}
      {activeTab === "profile" && (
        <form onSubmit={handleProfileSave} className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-heading text-lg font-bold text-white">Personal Information</h3>
            <p className="text-xs text-brand-secondary">Primary legal identity associated with trading account and withdrawal beneficiary.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-brand-secondary">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-secondary">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-secondary">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-secondary">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-secondary">Country of Residence</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-secondary">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#181d18] px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
              >
                <option value="America/New_York (UTC-5)" className="bg-[#181d18] text-white">America/New_York (UTC-5)</option>
                <option value="Europe/London (UTC+0)" className="bg-[#181d18] text-white">Europe/London (UTC+0)</option>
                <option value="Europe/Paris (UTC+1)" className="bg-[#181d18] text-white">Europe/Paris (UTC+1)</option>
                <option value="Asia/Singapore (UTC+8)" className="bg-[#181d18] text-white">Asia/Singapore (UTC+8)</option>
                <option value="Asia/Tokyo (UTC+9)" className="bg-[#181d18] text-white">Asia/Tokyo (UTC+9)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-brand-secondary">Residential Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-black transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? "Saving..." : "Save Profile Changes"}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── TAB 2: SECURITY & PASSWORD ────────────────────────────────────── */}
      {activeTab === "security" && (
        <div className="space-y-6">
          {/* Password change card */}
          <form onSubmit={handlePasswordChange} className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md space-y-5">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-white">Change Password</h3>
              <p className="text-xs text-brand-secondary">Maintain password hygiene with at least 8 characters and special symbols.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-brand-secondary">Current Password</label>
                <PasswordInput
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-secondary">New Password</label>
                <PasswordInput
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-secondary">Confirm New Password</label>
                <PasswordInput
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-black transition-all hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                <Key className="h-4 w-4" />
                <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          </form>

          {/* 2FA card */}
          <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-brand-secondary">
                    Mandatory TOTP authenticator prompt (Google Authenticator / Authy) required for capital withdrawals.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggle2FA}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  twoFactor
                    ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    : "bg-brand-primary text-black"
                }`}
              >
                {twoFactor ? "Enabled (Active)" : "Enable 2FA"}
              </button>
            </div>

            {twoFactor && (
              <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Two-Factor Authentication is currently safeguarding your withdrawals and API access.</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Sessions card */}
          <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-white">Active Login Sessions</h3>
                <p className="text-xs text-brand-secondary">Logged in browsers and IP address signatures.</p>
              </div>

              <button
                type="button"
                onClick={handleTerminateSessions}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Terminate All Other Sessions</span>
              </button>
            </div>

            <div className="mt-4 divide-y divide-white/5 text-xs">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Chrome on Windows (Current Session)</p>
                    <p className="text-[11px] text-brand-secondary">IP: 197.210.84.14 • Lagos, Nigeria</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  Active Now
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
                  <div>
                    <p className="font-semibold text-white">Safari on iOS</p>
                    <p className="text-[11px] text-brand-secondary">IP: 102.89.33.20 • London, UK</p>
                  </div>
                </div>
                <span className="text-[11px] text-brand-secondary">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: TRADING PREFERENCES ─────────────────────────────────────── */}
      {activeTab === "preferences" && (
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
            <div className="border-b border-white/10 pb-4"><h3 className="font-heading text-lg font-bold text-white">Language &amp; currency</h3><p className="text-xs text-brand-secondary">Choose how the platform reads and displays amounts. Trading and settlement remain in USD.</p></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-semibold text-brand-secondary">Language<select value={language} onChange={(event) => void saveDisplayPreference("language", event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">{Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label><label className="grid gap-2 text-xs font-semibold text-brand-secondary">Display currency<select value={currency} onChange={(event) => void saveDisplayPreference("currency", event.target.value)} className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white">{supportedCurrencies.map((code) => <option key={code} value={code}>{code}</option>)}</select></label></div>
          </section>
          <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-white">Execution & Risk Guard Settings</h3>
              <p className="text-xs text-brand-secondary">Tailor order routing behavior, slippage tolerance, and margin notifications.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-brand-secondary">Default Order Leverage</label>
                <select
                  value={defaultLeverage}
                  onChange={(e) => setDefaultLeverage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#181d18] px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="1" className="bg-[#181d18] text-white">1x (Spot / No Leverage)</option>
                  <option value="10" className="bg-[#181d18] text-white">10x Leverage</option>
                  <option value="25" className="bg-[#181d18] text-white">25x Leverage</option>
                  <option value="50" className="bg-[#181d18] text-white">50x Leverage</option>
                  <option value="100" className="bg-[#181d18] text-white">100x Maximum Leverage</option>
                </select>
                <p className="mt-1 text-[11px] text-brand-secondary">Pre-fills new order tickets with this leverage multiplier.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-secondary">Max Slippage Tolerance (%)</label>
                <select
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#181d18] px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="0.1" className="bg-[#181d18] text-white">0.1% (Strict - Low Fill Risk)</option>
                  <option value="0.5" className="bg-[#181d18] text-white">0.5% (Recommended Standard)</option>
                  <option value="1.0" className="bg-[#181d18] text-white">1.0% (Fast Fill in Volatility)</option>
                </select>
                <p className="mt-1 text-[11px] text-brand-secondary">Orders cancel automatically if mark price slips beyond threshold.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-secondary">Margin Call Alert Threshold (%)</label>
                <select
                  value={marginAlert}
                  onChange={(e) => setMarginAlert(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#181d18] px-3 py-2 text-sm text-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="90" className="bg-[#181d18] text-white">90% Margin Level</option>
                  <option value="80" className="bg-[#181d18] text-white">80% Margin Level (Standard)</option>
                  <option value="60" className="bg-[#181d18] text-white">60% Margin Level (High Risk)</option>
                </select>
                <p className="mt-1 text-[11px] text-brand-secondary">Instant notification sent to deposit funds before liquidation occurs.</p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-4">
                <div>
                  <p className="text-xs font-bold text-white">1-Click Fast Execution</p>
                  <p className="text-[11px] text-brand-secondary">Bypass secondary order confirmation popups.</p>
                </div>
                <input
                  type="checkbox"
                  checked={oneClickTrading}
                  onChange={(e) => setOneClickTrading(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Email notifications */}
          <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md">
            <div className="border-b border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-white">Email & Push Notifications</h3>
              <p className="text-xs text-brand-secondary">Manage what transactional alerts reach your inbox.</p>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <label className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 cursor-pointer">
                <div>
                  <span className="font-semibold text-white">Order Fill Confirmations</span>
                  <p className="text-[11px] text-brand-secondary">Receive real-time notification on position open, close, and TP/SL hits.</p>
                </div>
                <input type="checkbox" checked={emailFills} onChange={(e) => setEmailFills(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 cursor-pointer">
                <div>
                  <span className="font-semibold text-white">Urgent Margin Call Notifications</span>
                  <p className="text-[11px] text-brand-secondary">Immediate priority alert if margin level approaches danger threshold.</p>
                </div>
                <input type="checkbox" checked={emailMarginCalls} onChange={(e) => setEmailMarginCalls(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 cursor-pointer">
                <div>
                  <span className="font-semibold text-white">Capital Withdrawal Alerts</span>
                  <p className="text-[11px] text-brand-secondary">Security email whenever a withdrawal request is initialized.</p>
                </div>
                <input type="checkbox" checked={emailWithdrawals} onChange={(e) => setEmailWithdrawals(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: VERIFICATION & TIERS ────────────────────────────────────── */}
      {activeTab === "kyc" && (
        <div className="rounded-2xl border border-white/10 bg-brand-surface/70 p-6 shadow-sm backdrop-blur-md space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-heading text-lg font-bold text-white">Identity Verification & Account Tiers</h3>
            <p className="text-xs text-brand-secondary">Current compliance status and daily transactional capacity limits.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={`rounded-xl border p-4 text-xs ${!kycApproved ? "border-brand-primary/40 bg-brand-primary/5" : "border-white/10 bg-white/[0.02]"}`}><span className="text-[10px] font-bold uppercase text-brand-secondary">Tier 1 • Account setup</span><h4 className="mt-1 text-base font-bold text-white">Profile &amp; sign-in</h4><p className="mt-2 text-brand-secondary">Your account profile and sign-in are active.</p><div className="mt-4 flex items-center gap-1.5 font-bold text-emerald-400"><CheckCircle2 className="h-4 w-4" /><span>Active</span></div></div>
            <div className={`rounded-xl border p-4 text-xs ${kycApproved ? "border-emerald-400/40 bg-emerald-400/5" : "border-white/10 bg-white/[0.02]"}`}><span className={`text-[10px] font-bold uppercase ${kycApproved ? "text-emerald-400" : "text-brand-secondary"}`}>Tier 2 • Identity verified</span><h4 className="mt-1 text-base font-bold text-white">Government ID review</h4><p className="mt-2 text-brand-secondary">{kycApproved ? "Your identity verification has been approved." : kycRejected ? "Your verification needs an updated submission." : kycSubmitted ? "Your documents are under manual review." : "Submit your identity document to start verification."}</p>{kycApproved ? <div className="mt-4 flex items-center gap-1.5 font-bold text-emerald-400"><CheckCircle2 className="h-4 w-4" /><span>Approved</span></div> : <Link href="/dashboard/assistance" className="mt-4 inline-flex rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-3 py-1 font-semibold text-brand-primary hover:bg-brand-primary/20">{kycRejected ? "Resubmit verification" : kycSubmitted ? "View verification" : "Start verification"}</Link>}</div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs"><span className="text-[10px] font-bold uppercase text-brand-secondary">Tier 3 • Institutional</span><h4 className="mt-1 text-base font-bold text-white">Enhanced review</h4><p className="mt-2 text-brand-secondary">Institutional eligibility is reviewed separately after identity verification.</p><button type="button" disabled={!kycApproved} className="mt-4 rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Apply for VIP Tier</button></div>
          </div>
        </div>
      )}
    </div>
  );
}