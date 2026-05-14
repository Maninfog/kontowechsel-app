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
  formData: FlowFormData;
  setFormData: (patch: Partial<FlowFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetFlow: () => void;
}

const FlowContext = createContext<FlowStoreValue | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [currentStep, setCurrentStep] = useState(1);
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
    setCurrentStep(1);
  }, []);

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
      const next = prev - 1;
      navigate({ to: STEP_PATHS[next] });
      return next;
    });
  }, [navigate]);

  const value = useMemo(
    () => ({
      currentStep,
      formData,
      setFormData,
      nextStep,
      prevStep,
      resetFlow,
    }),
    [currentStep, formData, setFormData, nextStep, prevStep, resetFlow],
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
