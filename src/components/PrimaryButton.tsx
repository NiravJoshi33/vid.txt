import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function PrimaryButton({ children, loading, className, disabled, ...props }: Props) {
  return (
    <Button
      className={cn(
        "rounded-xl px-6 h-11 gap-2 text-sm font-semibold tracking-wide uppercase",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {!loading && <ArrowRight className="size-4" />}
    </Button>
  );
}
