import { cn } from "@/lib/utils";

export type PlatformStatus = "live" | "soon";

export interface Platform {
  name: string;
  status: PlatformStatus;
  icon: React.ReactNode;
}

const DiscordIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.197.353-.43.83-.59 1.207a18.3 18.3 0 0 0-5.937 0A12.6 12.6 0 0 0 9.434 3a19.74 19.74 0 0 0-3.76 1.369C2.4 9.046 1.51 13.58 1.957 18.057A19.9 19.9 0 0 0 7.86 21c.476-.65.9-1.34 1.265-2.064a13 13 0 0 1-1.99-.95c.167-.123.33-.252.486-.385a14.13 14.13 0 0 0 12.76 0c.158.133.32.262.487.385-.638.378-1.305.696-1.99.95.365.724.789 1.414 1.265 2.064a19.86 19.86 0 0 0 5.91-2.943c.523-5.197-.892-9.69-3.737-13.688zM8.02 15.331c-1.18 0-2.157-1.085-2.157-2.42s.957-2.42 2.157-2.42c1.21 0 2.176 1.094 2.157 2.42 0 1.335-.957 2.42-2.157 2.42m7.962 0c-1.18 0-2.157-1.085-2.157-2.42s.957-2.42 2.157-2.42c1.21 0 2.176 1.094 2.157 2.42 0 1.335-.947 2.42-2.157 2.42" />
  </svg>
);

const TelegramIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z" />
  </svg>
);

const SlackIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
  </svg>
);

const RevoltIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <circle cx="12" cy="12" r="10" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8 8h5a3 3 0 0 1 0 6H8V8zm0 6l4 4"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

export const PLATFORMS: Platform[] = [
  { name: "Discord", status: "live", icon: DiscordIcon },
  { name: "Telegram", status: "soon", icon: TelegramIcon },
  { name: "Slack", status: "soon", icon: SlackIcon },
  { name: "Revolt", status: "soon", icon: RevoltIcon },
];

export function PlatformBadge({
  platform,
  size = "md",
}: {
  platform: Platform;
  size?: "sm" | "md";
}) {
  const isLive = platform.status === "live";
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
        isLive
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border bg-surface/40 text-muted-foreground",
        size === "sm" && "px-2.5 py-1 text-xs",
      )}
    >
      <span className={cn(isLive ? "text-primary" : "text-muted-foreground")}>{platform.icon}</span>
      <span className="text-sm font-medium">{platform.name}</span>
      <span
        className={cn(
          "ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
          isLive ? "bg-success/20 text-success" : "bg-muted text-muted-foreground",
        )}
      >
        {isLive ? "Online" : "Em breve"}
      </span>
    </div>
  );
}
