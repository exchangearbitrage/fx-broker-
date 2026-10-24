import { StakingEarnView } from "@/components/portal/StakingEarnView";

export const metadata = {
  title: "Staking & Yield Vaults",
  description: "Monitor active crypto staking positions and claim daily compounding rewards.",
};

export default function EarnPage() {
  return <StakingEarnView />;
}
