import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const privateNoStore = { "Cache-Control": "private, no-store, max-age=0, must-revalidate" };

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { headers: privateNoStore });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        localCurrency: user.localCurrency,
        displayCurrency: user.displayCurrency,
        preferredLanguage: user.preferredLanguage,
        displayCurrencyManuallySet: user.displayCurrencyManuallySet,
      },
    }, { headers: privateNoStore });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null }, { headers: privateNoStore });
  }
}
