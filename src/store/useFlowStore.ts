import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { Payment } from "@/types/database";
import type { ZahlungListRow } from "@/lib/map-zahlung-row";

export type FlowActor = "customer" | "employee";

export interface FlowFormData {
  customerName: string;
  newIban: string;
  newBankName: string;
  switchDate: string;
  oldIban: string;
  oldBankName: string;
  selectedPayments: Payment[];
  /** User finished Zahlungen step with „Keine übernehmen“. */
  noPaymentsSelected?: boolean;
  /**
   * Manually captured payments from altes-konto; on /zahlungen they are shown
   * first, then DEMO_PAYMENTS (bank analysis demo) is appended. null after automatic import.
   */
  zahlungenManualRows?: ZahlungListRow[] | null;
  /** true, wenn im manuellen Flow ein Kontoauszug-Foto angehängt wurde (Schritt altes-konto). */
  kontoauszugFotoHinterlegt?: boolean;
  /** Mitarbeiter-Flow: Referenz / Rückruf zum Kunden (analoger Kunde). */
  assistedCustomerReference?: string;
  assistedCustomerPhone?: string;
  /** Mitarbeiter Kundenprofil: Ausweis/Pass (Foto) angehängt — Prototyp, kein echter Check. */
  identifikationsnachweisKundeHinterlegt?: boolean;
}

export const initialFormData: FlowFormData = {
  customerName: "",
  newIban: "",
  newBankName: "",
  switchDate: "",
  oldIban: "",
  oldBankName: "",
  selectedPayments: [],
  noPaymentsSelected: false,
  zahlungenManualRows: null,
  kontoauszugFotoHinterlegt: false,
  assistedCustomerReference: "",
  assistedCustomerPhone: "",
  identifikationsnachweisKundeHinterlegt: false,
};

const STEP_PATHS: Record<number, string> = {
  1: "/start",
  2: "/wechsel",
  3: "/altes-konto",
  4: "/zahlungen",
  5: "/pruefen",
  6: "/fertig",
  7: "/dashboard",
};

const PATH_TO_STEP: Record<string, number> = {
  "/start": 1,
  "/wechsel": 2,
  "/altes-konto": 3,
  "/zahlungen": 4,
  "/pruefen": 5,
  "/fertig": 6,
  "/dashboard": 7,
};

/** Maps flow step (1–7) to Stepper `currentStep` (0–5). */
export function flowStepToStepperIndex(step: number): number {
  if (step <= 1) return 0;
  if (step >= 7) return 5;
  return step - 2;
}

interface FlowStoreValue {
  currentStep: number;
  /** Kunde: klassischer Wizard ab /start. Mitarbeiter: Assistenz ohne Login, Einstieg /wechsel. */
  flowActor: FlowActor;
  formData: FlowFormData;
  setFormData: (patch: Partial<FlowFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetFlow: () => void;
  /** Nach Mitarbeiter-Login: Fall leeren, Modus „employee“, Navigation zu /wechsel. */
  enterEmployeeAssistedFlow: () => void;
}

const FlowContext = createContext<FlowStoreValue | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [currentStep, setCurrentStep] = useState(1);
  const [flowActor, setFlowActor] = useState<FlowActor>("customer");
  const [formData, setFormDataState] = useState<FlowFormData>(initialFormData);

  useEffect(() => {
    const s = PATH_TO_STEP[pathname];
    if (s != null) setCurrentStep(s);
  }, [pathname]);

  const setFormData = useCallback((patch: Partial<FlowFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFlow = useCallback(() => {
    setFormDataState(initialFormData);
    setFlowActor("customer");
    setCurrentStep(1);
  }, []);

  const enterEmployeeAssistedFlow = useCallback(() => {
    setFormDataState(initialFormData);
    setFlowActor("employee");
    navigate({ to: "/wechsel" });
  }, [navigate]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= 7) return prev;
      const next = prev + 1;
      navigate({ to: STEP_PATHS[next] });
      return next;
    });
  }, [navigate]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev <= 1) {
        navigate({ to: "/" });
        return 1;
      }
      if (prev === 2 && flowActor === "employee") {
        setFlowActor("customer");
        setFormDataState(initialFormData);
        navigate({ to: "/" });
        return 1;
      }
      const next = prev - 1;
      navigate({ to: STEP_PATHS[next] });
      return next;
    });
  }, [navigate, flowActor]);

  const value = useMemo(
    () => ({
      currentStep,
      flowActor,
      formData,
      setFormData,
      nextStep,
      prevStep,
      resetFlow,
      enterEmployeeAssistedFlow,
    }),
    [
      currentStep,
      flowActor,
      formData,
      setFormData,
      nextStep,
      prevStep,
      resetFlow,
      enterEmployeeAssistedFlow,
    ],
  );

  return React.createElement(FlowContext.Provider, { value }, children);
}

export function useFlowStore(): FlowStoreValue {
  const ctx = useContext(FlowContext);
  if (!ctx) {
    throw new Error("useFlowStore must be used within FlowProvider");
  }
  return ctx;
}
