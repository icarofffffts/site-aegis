import { cn } from "@/lib/utils";
import arxLogo from "@/assets/arx-logo.png";

export function AegisLogo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#30363d] bg-[#161b22] text-white">
        <img src={arxLogo} alt="ARX DEVS" className="h-8 w-8 object-contain" />
      </div>
      {withText && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Aegis
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8590]">
            by ARX DEVS
          </span>
        </div>
      )}
    </div>
  );
}
