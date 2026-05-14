export interface SwitchingCase {
  id: string;
  customer_name: string;
  old_iban: string;
  new_iban: string;
  new_bank_name: string;
  switch_date: string;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  session_owner_id?: string;
}

export type PaymentConfidence = "high" | "medium" | "low";

export interface Payment {
  id: string;
  case_id: string;
  payee_name: string;
  payee_iban: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "yearly" | "weekly";
  type: "lastschrift" | "dauerauftrag";
  selected: boolean;
  /** Model / rule match confidence; optional for legacy rows */
  confidence?: PaymentConfidence;
}
