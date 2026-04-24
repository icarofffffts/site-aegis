import { cn } from "@/lib/utils";
import arxLogo from "@/assets/arx-logo.png";

export function ShieldLogo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/10 ring-1 ring-primary/30 shadow-glow">
        <img src={arxLogo} alt="ARX DEVS" className="h-7 w-7 object-contain" />
      </div>
      {withText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Shield
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            by ARX DEVS
          </span>
        </div>
      )}
    </div>
  );
}
