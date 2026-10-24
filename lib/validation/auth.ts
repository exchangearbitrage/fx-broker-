import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const MIN_SIGNUP_AGE = 18;
function validBirthDate(value: string) { const parsed = new Date(`${value}T00:00:00Z`); if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return false; const today = new Date(); let age = today.getUTCFullYear() - parsed.getUTCFullYear(); const month = today.getUTCMonth() - parsed.getUTCMonth(); if (month < 0 || (month === 0 && today.getUTCDate() < parsed.getUTCDate())) age--; return parsed <= today && age >= MIN_SIGNUP_AGE; }
function validCurrency(value: string) { try { new Intl.NumberFormat("en", { style: "currency", currency: value }); return true; } catch { return false; } }

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name (at least 2 characters).").max(80, "Your first name is too long."),
  lastName: z.string().trim().min(2, "Enter your last name (at least 2 characters).").max(80, "Your last name is too long."),
  email: z.string().trim().email("Enter a valid email address, for example name@example.com.").max(160, "Your email address is too long."),
  password: z.string().min(8, "Your password must contain at least 8 characters.").max(128, "Your password must be 128 characters or fewer."),
  confirmPassword: z.string(),
  country: z.string().trim().min(2, "Select your country of residence."),
  countryCode: z.string().trim().length(2, "Select your country of residence."),
  phone: z.string().trim().min(4, "Enter your phone number."),
  accountCurrency: z.literal("USD"),
  localCurrency: z.string().regex(/^[A-Z]{3}$/, "Select a valid display currency.").optional(),
  displayCurrency: z.string().regex(/^[A-Z]{3}$/, "Select a valid display currency.").refine(validCurrency, "Select a valid display currency."),
  preferredLanguage: z.enum(["en", "es", "fr", "de", "pt", "it", "nl", "pl", "ru", "tr", "ar", "hi", "bn", "ur", "id", "vi", "th", "zh-CN", "zh-TW", "ja", "ko", "sw", "ha", "yo", "ig"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth.").refine(validBirthDate, `You must be at least ${MIN_SIGNUP_AGE} to open an account.`),
  challengeId: z.string().min(1, "The verification question did not load. Please refresh and try again."),
  challengeAnswer: z.number().int("Enter a whole-number answer to the verification question.").min(0).max(100),
}).superRefine(({ password, confirmPassword, phone: phoneValue }, context) => {
  if (password !== confirmPassword) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["confirmPassword"], message: "The passwords do not match. Please enter the same password twice." });
  }
  const phone = parsePhoneNumberFromString(phoneValue);
  if (!phone?.isValid()) context.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Enter a valid phone number including the selected dial code." });
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(160),
  password: z.string().min(1, "Enter your password.").max(128),
});
