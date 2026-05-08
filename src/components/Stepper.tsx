interface StepperProps {
  currentStep?: number;
}

const STEPS = [
  "Neues Konto",
  "Altes Konto",
  "Zahlungen",
  "Prüfen",
  "Fertig",
  "Fortschritt",
];

export function Stepper({ currentStep = 0 }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((label, i) => {
          const isComplete = i < currentStep;
          const isCurrent = i === currentStep;
          const active = isComplete || isCurrent;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <div
                  className={[
                    "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border",
                    isCurrent ? "ring-4 ring-primary/25" : "",
                  ].join(" ")}
                >
                  {i + 1}
                </div>
                <span
                  className={[
                    "text-[10px] sm:text-xs text-center leading-tight truncate max-w-full",
                    isCurrent
                      ? "text-foreground font-semibold"
                      : active
                        ? "text-foreground/80"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    "h-0.5 flex-1 mx-1 sm:mx-2 -mt-6 rounded-full transition-colors",
                    i < currentStep ? "bg-primary" : "bg-border",
                  ].join(" ")}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
