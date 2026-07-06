import { cn } from "@/lib/utils";
import arxLogo from "@/assets/arx-logo.png";

export function AegisLogo({
  className,
  withText = true,
  brandName,
  logoUrl,
  hideBranding,
}: {
  className?: string;
  withText?: boolean;
  brandName?: string | null;
  logoUrl?: string | null;
  hideBranding?: boolean | null;
}) {
  const showCustom = brandName || logoUrl;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#30363d] bg-[#161b22] text-white">
        {logoUrl ? (
          <img src={logoUrl} alt={brandName ?? "Logo"} className="h-8 w-8 object-contain" />
        ) : (
          <img src={arxLogo} alt="ARX DEVS" className="h-8 w-8 object-contain" />
        )}
      </div>
      {withText && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            {showCustom ? brandName || "Aegis" : "Aegis"}
          </span>
          {!hideBranding && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7d8590]">
              {showCustom ? "by ARX DEVS" : "by ARX DEVS"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
