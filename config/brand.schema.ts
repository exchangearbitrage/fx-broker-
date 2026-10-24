import { z } from "zod";

const nonEmptyUrl = z.string().url().or(z.literal(""));

const trustBadgeSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    verifyUrl: nonEmptyUrl,
  })
  .superRefine((badge, ctx) => {
    const text = `${badge.title} ${badge.description}`.toLowerCase();
    const requiresVerification = ["regulation", "regulated", "licensing", "licensed", "insurance", "insured", "fund protection", "protected funds"].some((term) =>
      text.includes(term),
    );

    if (requiresVerification && !badge.verifyUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["verifyUrl"],
        message: "verifyUrl is required for trust badges mentioning regulation, licensing, insurance, or fund protection.",
      });
    }
  });

const featureFlagsSchema = z.object({
  cryptoTrading: z.boolean(),
  forex: z.boolean(),
  shares: z.boolean(),
  indices: z.boolean(),
  etfs: z.boolean(),
  copyTrading: z.boolean(),
  automatedTrading: z.boolean(),
  education: z.boolean(),
  liveChat: z.boolean(),
  newsletter: z.boolean(),
  webinars: z.boolean(),
  demoAccounts: z.boolean(),
});

export const brandConfigSchema = z
  .object({
    mode: z.enum(["demo", "live"]).default("demo"),
    brand: z.object({
      name: z.string().min(1),
      tagline: z.string().min(1),
      legalEntityName: z.string(),
      logoLight: z.string(),
      logoDark: z.string(),
      favicon: z.string(),
      ogImage: z.string(),
      supportEmail: z.string().email().or(z.literal("")),
      supportPhone: z.string(),
      address: z.string(),
      domain: z.string(),
    }),
    theme: z.object({
      primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      success: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      danger: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      fontHeading: z.string().min(1),
      fontBody: z.string().min(1),
      borderRadius: z.string().min(1),
    }),
    features: featureFlagsSchema,
    verification: z.object({
      defaultMethod: z.enum(["captchaPuzzle", "emailVerification"]),
      emailVerificationEnabled: z.boolean(),
      captchaPuzzleEnabled: z.boolean(),
    }),
    content: z.object({
      hero: z.object({
        headline: z.string().min(1),
        subheadline: z.string().min(1),
        primaryCta: z.string().min(1),
        secondaryCta: z.string().min(1),
        videoUrl: z.string().url().or(z.literal("")),
      }),
      sections: z.array(
        z.object({
          id: z.string().min(1),
          title: z.string().min(1),
          body: z.string().min(1),
        }),
      ),
      faq: z.array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
        }),
      ),
      howItWorks: z.array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1),
          href: z.string().min(1),
        }),
      ),
      stats: z.array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
        }),
      ),
      tradingConditions: z.array(
        z.object({
          label: z.string().min(1),
          value: z.string().min(1),
          description: z.string().min(1),
        }),
      ),
      services: z.array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1),
          href: z.string().min(1),
        }),
      ),
    }),
    instruments: z.array(
      z.object({
        symbol: z.string().min(1),
        name: z.string().min(1),
        icon: z.string(),
        category: z.enum(["crypto", "forex", "shares", "indices", "etfs", "energies"]),
      }),
    ),
    trustBadges: z.array(trustBadgeSchema).default([]),
    legal: z.object({
      regulatorName: z.string(),
      licenseNumber: z.string(),
      regulatorUrl: nonEmptyUrl,
      riskWarningText: z.string(),
      termsMarkdown: z.string(),
      privacyMarkdown: z.string(),
    }),
    kyc: z.object({
      countryIdRequirements: z.record(
        z.object({
          label: z.string().min(1),
          idNumberLabel: z.string().min(1),
          acceptedDocuments: z.array(z.string().min(1)).min(1),
        }),
      ),
      defaultRequirement: z.object({
        label: z.string().min(1),
        idNumberLabel: z.string().min(1),
        acceptedDocuments: z.array(z.string().min(1)).min(1),
      }),
    }),
    social: z.object({
      links: z.record(z.string().url().or(z.literal(""))),
    }),
    seo: z.object({
      titleTemplate: z.string().min(1),
      description: z.string().min(1),
      keywords: z.array(z.string()),
    }),
    currencyDefault: z.string().min(3),
    supportedLanguages: z.array(z.string().min(2)).min(1),
  })
  .superRefine((config, ctx) => {
    if (config.mode !== "live") {
      return;
    }

    const requiredLegalFields = ["regulatorName", "licenseNumber", "regulatorUrl", "riskWarningText"] as const;
    for (const field of requiredLegalFields) {
      if (!config.legal[field]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["legal", field],
          message: "Live mode requires complete legal and regulatory configuration.",
        });
      }
    }
  });

export type BrandConfig = z.infer<typeof brandConfigSchema>;
export type FeatureFlags = z.infer<typeof featureFlagsSchema>;
