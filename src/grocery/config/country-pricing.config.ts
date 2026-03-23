// src/grocery/config/country-pricing.config.ts

export type CountryCode =
  | 'AL' // Albania
  | 'XK' // Kosovo
  | 'MK' // North Macedonia
  | 'GR' // Greece
  | 'IT' // Italy
  | 'ES' // Spain
  | 'PT' // Portugal
  | 'FR' // France
  | 'DE' // Germany (base EU reference)
  | 'NL' // Netherlands
  | 'BE' // Belgium
  | 'AT' // Austria
  | 'CH' // Switzerland
  | 'UK' // United Kingdom
  | 'IE' // Ireland
  | 'PL' // Poland
  | 'RO' // Romania
  | 'BG' // Bulgaria
  | 'HR' // Croatia
  | 'HU' // Hungary
  | 'US' // United States
  | 'CA' // Canada
  | 'AU'; // Australia

export interface CountryPricingProfile {
  code: CountryCode;
  name: string;

  /**
   * The main currency people actually pay with in this country.
   * This is what your prices should be shown in by default.
   */
  currency: string;

  /**
   * The "anchor" currency for this country.
   * Most of Europe will be 'EUR', US will be 'USD', etc.
   * This is useful when we build the real FX engine later.
   */
  baseCurrency: string;

  /**
   * Cost-of-living / grocery price index relative to DE = 1.0.
   * Example:
   *  - 0.65  => cheaper than Germany
   *  - 1.20  => more expensive than Germany
   */
  priceIndex: number;

  /**
   * A rough default VAT / sales tax rate for groceries.
   * This is just a knob we can use later for analytics;
   * it does not need to be perfect right now.
   */
  defaultTaxRate: number;

  /**
   * Optional notes for debugging / analytics.
   */
  notes?: string;
}

/**
 * Germany (DE) is our "reference" with priceIndex = 1.0.
 * All other countries are relative to that.
 *
 * These numbers are APPROXIMATE and can be tweaked later.
 */
export const COUNTRY_PRICING_TABLE: Record<CountryCode, CountryPricingProfile> = {
  AL: {
    code: 'AL',
    name: 'Albania',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 0.65,
    defaultTaxRate: 0.20,
    notes: 'Lower average grocery prices vs central EU',
  },
  XK: {
    code: 'XK',
    name: 'Kosovo',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 0.60,
    defaultTaxRate: 0.18,
    notes: 'Very budget-friendly basket vs DE',
  },
  MK: {
    code: 'MK',
    name: 'North Macedonia',
    currency: 'MKD',
    baseCurrency: 'EUR',
    priceIndex: 0.62,
    defaultTaxRate: 0.18,
  },
  GR: {
    code: 'GR',
    name: 'Greece',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 0.95,
    defaultTaxRate: 0.24,
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 1.00,
    defaultTaxRate: 0.22,
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 0.93,
    defaultTaxRate: 0.21,
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 0.88,
    defaultTaxRate: 0.23,
  },
  FR: {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 1.05,
    defaultTaxRate: 0.20,
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 1.0,
    defaultTaxRate: 0.19,
    notes: 'Base reference country',
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 1.07,
    defaultTaxRate: 0.09,
  },
  BE: {
    code: 'BE',
    name: 'Belgium',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 1.06,
    defaultTaxRate: 0.06,
  },
  AT: {
    code: 'AT',
    name: 'Austria',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 1.03,
    defaultTaxRate: 0.10,
  },
  CH: {
    code: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    baseCurrency: 'CHF',
    priceIndex: 1.50,
    defaultTaxRate: 0.025,
    notes: 'Much more expensive groceries vs DE',
  },
  UK: {
    code: 'UK',
    name: 'United Kingdom',
    currency: 'GBP',
    baseCurrency: 'GBP',
    priceIndex: 1.05,
    defaultTaxRate: 0.00, // many groceries zero-rated
  },
  IE: {
    code: 'IE',
    name: 'Ireland',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 1.08,
    defaultTaxRate: 0.00,
  },
  PL: {
    code: 'PL',
    name: 'Poland',
    currency: 'PLN',
    baseCurrency: 'EUR',
    priceIndex: 0.70,
    defaultTaxRate: 0.05,
  },
  RO: {
    code: 'RO',
    name: 'Romania',
    currency: 'RON',
    baseCurrency: 'EUR',
    priceIndex: 0.60,
    defaultTaxRate: 0.09,
  },
  BG: {
    code: 'BG',
    name: 'Bulgaria',
    currency: 'BGN',
    baseCurrency: 'EUR',
    priceIndex: 0.58,
    defaultTaxRate: 0.09,
  },
  HR: {
    code: 'HR',
    name: 'Croatia',
    currency: 'EUR',
    baseCurrency: 'EUR',
    priceIndex: 0.85,
    defaultTaxRate: 0.05,
  },
  HU: {
    code: 'HU',
    name: 'Hungary',
    currency: 'HUF',
    baseCurrency: 'EUR',
    priceIndex: 0.75,
    defaultTaxRate: 0.18,
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    baseCurrency: 'USD',
    priceIndex: 1.15,
    defaultTaxRate: 0.00, // tax depends on state, we’ll handle later
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    baseCurrency: 'CAD',
    priceIndex: 1.10,
    defaultTaxRate: 0.05,
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    baseCurrency: 'AUD',
    priceIndex: 1.12,
    defaultTaxRate: 0.10,
  },
};
