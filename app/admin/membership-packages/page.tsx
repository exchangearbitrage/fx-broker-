import { MembershipPlanSettings } from "@/components/admin/MembershipPlanSettings";

export default function MembershipPackagesPage() {
  return <><p className="text-xs font-semibold uppercase tracking-widest text-brand-primary">Global configuration</p><h1 className="mt-2 font-heading text-3xl font-bold text-white">Membership packages</h1><p className="mt-2 text-sm text-brand-secondary">Manage the packages traders can purchase from their Live wallet.</p><MembershipPlanSettings /></>;
}

