import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = { label: string };

type Props = {
  steps: Step[];
  current: number;
};

export function Stepper({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  done && "bg-white border-2 border-milano text-milano",
                  active && "bg-milano text-white",
                  !done && !active && "bg-muted text-muted-foreground border-2 border-transparent"
                )}
              >
                {done ? <Check className="size-4 stroke-[2.5]" /> : <span>{i + 1}</span>}
              </div>
              <span
                className={cn(
                  "text-xs font-medium tracking-wide uppercase whitespace-nowrap",
                  active && "text-milano",
                  done && "text-milano/70",
                  !done && !active && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-3 mt-[-1rem]",
                  done ? "bg-milano/40" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
