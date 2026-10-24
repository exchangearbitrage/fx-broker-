import { getBrandConfig } from "@/config/loadBrandConfig";
import { WalletFundsView } from "@/components/portal/WalletFundsView";

export const metadata = { title: "Wallet & Capital Transfers", description: "View separated Live and Demo balances, funding, and account activity." };

export default function WalletPage() { return <WalletFundsView currency={getBrandConfig().currencyDefault} />; }