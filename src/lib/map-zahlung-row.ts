import type { Payment, PaymentConfidence } from "@/types/database";

export type ZahlungListType = "Lastschrift" | "Dauerauftrag";

export interface ZahlungListRow {
  id: string;
  name: string;
  type: ZahlungListType;
  iban: string;
  amount: number;
  frequency: string;
  confidence?: PaymentConfidence;
}

export function zahlungRowToStorePayment(
  row: ZahlungListRow,
  selected: boolean,
): Payment {
  const f = row.frequency.toLowerCase();
  let frequency: Payment["frequency"] = "monthly";
  if (f.includes("quart")) frequency = "quarterly";
  else if (f.includes("jahr")) frequency = "yearly";
  else if (f.includes("woche")) frequency = "weekly";
  else if (f.includes("halb")) frequency = "quarterly";

  return {
    id: row.id,
    case_id: "",
    payee_name: row.name,
    payee_iban: row.iban.replace(/\s/g, ""),
    amount: row.amount,
    frequency,
    type: row.type === "Lastschrift" ? "lastschrift" : "dauerauftrag",
    selected,
    confidence: row.confidence ?? "high",
  };
}
