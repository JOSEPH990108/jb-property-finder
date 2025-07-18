// src\lib\utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

// utils/propertyScoring.ts
type Property = {
  id: string;
  price: number;
  location: string;
  rooms: number;
  size: number;
  // ... other properties
};

type UserInput = {
  budget: [number, number];
  locations: string[];
  peopleCount: string;
  priorities: string[];
};

const COUNTRY_CODE_TO_ISO: Record<string, CountryCode> = {
  "+60": "MY",
  "+65": "SG",
  "+66": "TH",
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, decimals = 2): string {
  return `RM ${value.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  })}`;
}

export function round(num: number) {
  return Math.round(num * 100) / 100;
}

export function validateMobileByCountry(
  rawInput: string,
  countryCode: string,
  countryIso?: string
): {
  isValid: boolean;
  formatted?: string;
  reason?: string;
} {
  const isoCode =
    (countryIso as CountryCode) || COUNTRY_CODE_TO_ISO[countryCode];

  if (!isoCode) {
    return {
      isValid: false,
      reason: `Unsupported or unknown country code: ${countryCode}`,
    };
  }

  // Remove non-digit characters
  let cleaned = rawInput.replace(/\D/g, "");
  if (!cleaned) {
    return { isValid: false, reason: "Phone number is required" };
  }

  // Try to format it into international style
  if (cleaned.startsWith(countryCode.replace("+", ""))) {
    cleaned = `+${cleaned}`;
  } else if (cleaned.startsWith("0")) {
    cleaned = `${countryCode}${cleaned.slice(1)}`;
  } else {
    cleaned = `${countryCode}${cleaned}`;
  }

  const parsed = parsePhoneNumberFromString(cleaned, isoCode);

  if (!parsed || !parsed.isValid()) {
    return {
      isValid: false,
      reason: `Invalid phone number format for country ${isoCode}`,
    };
  }

  return {
    isValid: true,
    formatted: parsed.number,
  };
}

export function getRoomRequirement(peopleCount: string): number {
  if (peopleCount === "1-2") return 2;
  if (peopleCount === "3-5") return 3;
  return 4;
}

export function calculatePropertyScore(
  property: Property,
  user: UserInput
): number {
  let score = 0;
  const [minBudget, maxBudget] = user.budget;

  // Budget Match (within 10% buffer)
  if (property.price >= minBudget * 0.9 && property.price <= maxBudget * 1.1) {
    score += 30;
  } else if (property.price < minBudget || property.price > maxBudget) {
    score -= 10;
  }

  // Location Match (exact match bonus)
  if (user.locations.includes(property.location)) {
    score += 25;
  } else if (user.locations.some((loc) => property.location.includes(loc))) {
    score += 10; // Partial match
  }

  // Room Count Match
  const requiredRooms = getRoomRequirement(user.peopleCount);
  if (property.rooms >= requiredRooms) {
    score += 20;
  } else {
    score -= (requiredRooms - property.rooms) * 5;
  }

  // Priority-based scoring
  user.priorities.forEach((priority) => {
    switch (priority) {
      case "Price":
        const priceRatio =
          1 - (property.price - minBudget) / (maxBudget - minBudget);
        score += Math.max(0, priceRatio * 15);
        break;
      case "House Size":
        if (property.size > 100) score += 15;
        else if (property.size > 70) score += 10;
        else if (property.size > 50) score += 5;
        break;
      case "Location":
        if (user.locations.includes(property.location)) score += 15;
        break;
    }
  });

  return Math.max(0, score);
}

export const getMalaysiaTime = () => {
  const utc = new Date();
  const malaysiaOffsetMs = 8 * 60 * 60 * 1000;
  return new Date(utc.getTime() + malaysiaOffsetMs);
};
