import type { ZahlungListRow } from "@/lib/map-zahlung-row";

/** Masked-style legacy IBAN for demo after “bank login” (no real PSD2 yet). */
export const DEMO_OLD_IBAN_INPUT = "DE12 3456 7890 1234 5678 90";

/** Single source for the Zahlungen step and dashboard partner list (demo). */
export const DEMO_PAYMENTS: ZahlungListRow[] = [
  {
    id: "1",
    name: "Netflix",
    type: "Lastschrift",
    iban: "DE89 **** **** 1234",
    amount: 12.99,
    frequency: "monatlich",
    confidence: "high",
  },
  {
    id: "2",
    name: "Stadtwerke München",
    type: "Lastschrift",
    iban: "DE12 **** **** 5678",
    amount: 89.5,
    frequency: "monatlich",
    confidence: "high",
  },
  {
    id: "3",
    name: "Amazon Prime",
    type: "Lastschrift",
    iban: "DE45 **** **** 9012",
    amount: 89.9,
    frequency: "jährlich",
    confidence: "low",
  },
  {
    id: "4",
    name: "Miete — Hausverwaltung GmbH",
    type: "Dauerauftrag",
    iban: "DE67 **** **** 3456",
    amount: 1240.0,
    frequency: "monatlich",
    confidence: "high",
  },
  {
    id: "5",
    name: "GEZ / ARD ZDF Beitragsservice",
    type: "Lastschrift",
    iban: "DE34 **** **** 7890",
    amount: 55.08,
    frequency: "quartalsweise",
    confidence: "low",
  },
  {
    id: "6",
    name: "Vodafone GmbH",
    type: "Lastschrift",
    iban: "DE56 **** **** 2345",
    amount: 39.99,
    frequency: "monatlich",
    confidence: "medium",
  },
  {
    id: "7",
    name: "Spotify AB",
    type: "Lastschrift",
    iban: "DE78 **** **** 6789",
    amount: 10.99,
    frequency: "monatlich",
    confidence: "low",
  },
  {
    id: "8",
    name: "Allianz Versicherung",
    type: "Dauerauftrag",
    iban: "DE90 **** **** 0123",
    amount: 287.5,
    frequency: "jährlich",
    confidence: "high",
  },
];

export type DemoPartnerStatus = "confirmed" | "notified" | "pending" | "action";

/** Demo lifecycle status per payment id (dashboard badges). */
export const DEMO_PARTNER_STATUS_BY_ID: Record<string, DemoPartnerStatus> = {
  "1": "confirmed",
  "2": "confirmed",
  "3": "notified",
  "4": "action",
  "5": "pending",
  "6": "pending",
  "7": "notified",
  "8": "pending",
};
