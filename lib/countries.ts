/** Common country dial codes for waitlist phone field */
export type Country = {
  code: string;
  name: string;
  dial: string;
  flag: string;
  /** Approximate national number length range (digits only) */
  minLen: number;
  maxLen: number;
};

export const COUNTRIES: Country[] = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', minLen: 10, maxLen: 10 },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', minLen: 10, maxLen: 10 },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', minLen: 10, maxLen: 11 },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', minLen: 10, maxLen: 10 },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', minLen: 9, maxLen: 9 },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', minLen: 10, maxLen: 12 },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', minLen: 9, maxLen: 9 },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬', minLen: 8, maxLen: 8 },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪', minLen: 9, maxLen: 9 },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱', minLen: 9, maxLen: 9 },
  { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪', minLen: 9, maxLen: 9 },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', minLen: 10, maxLen: 11 },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽', minLen: 10, maxLen: 10 },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', minLen: 10, maxLen: 11 },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷', minLen: 9, maxLen: 11 },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿', minLen: 8, maxLen: 10 },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', minLen: 9, maxLen: 9 },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸', minLen: 9, maxLen: 9 },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹', minLen: 9, maxLen: 10 },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪', minLen: 9, maxLen: 10 },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭', minLen: 9, maxLen: 9 },
  { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱', minLen: 9, maxLen: 9 },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹', minLen: 9, maxLen: 9 },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭', minLen: 10, maxLen: 10 },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', minLen: 10, maxLen: 10 },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', minLen: 9, maxLen: 10 },
  { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱', minLen: 9, maxLen: 9 },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰', minLen: 8, maxLen: 8 },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩', minLen: 9, maxLen: 12 },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾', minLen: 9, maxLen: 10 },
];

/** Guess country from browser timezone / locale */
export function detectDefaultCountry(): Country {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    const region = locale.split('-')[1]?.toUpperCase();

    const tzMap: Record<string, string> = {
      'Asia/Kolkata': 'IN',
      'Asia/Calcutta': 'IN',
      'America/New_York': 'US',
      'America/Chicago': 'US',
      'America/Denver': 'US',
      'America/Los_Angeles': 'US',
      'America/Toronto': 'CA',
      'America/Vancouver': 'CA',
      'Europe/London': 'GB',
      'Europe/Dublin': 'IE',
      'Europe/Berlin': 'DE',
      'Europe/Paris': 'FR',
      'Europe/Amsterdam': 'NL',
      'Australia/Sydney': 'AU',
      'Australia/Melbourne': 'AU',
      'Asia/Singapore': 'SG',
      'Asia/Dubai': 'AE',
      'Asia/Tokyo': 'JP',
      'Asia/Seoul': 'KR',
      'Pacific/Auckland': 'NZ',
      'Africa/Johannesburg': 'ZA',
      'America/Sao_Paulo': 'BR',
      'America/Mexico_City': 'MX',
    };

    const byTz = tzMap[tz];
    if (byTz) {
      const found = COUNTRIES.find((c) => c.code === byTz);
      if (found) return found;
    }

    if (region) {
      const found = COUNTRIES.find((c) => c.code === region);
      if (found) return found;
    }
  } catch {
    /* fall through */
  }

  return COUNTRIES[0]; // India as sensible default for Attnio
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string, country: Country): boolean {
  const digits = digitsOnly(phone);
  // Basic 7–15 digit international check, tightened by country when known
  if (digits.length < 7 || digits.length > 15) return false;
  return digits.length >= country.minLen && digits.length <= country.maxLen;
}
