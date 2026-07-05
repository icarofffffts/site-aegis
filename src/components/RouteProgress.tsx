import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

export function RouteProgress() {
  const isLoading = useRouterState({
    select: (s) => s.status === "pending" || s.isLoading || s.isTransitioning,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      return;
    }
    // Let the bar finish its grow animation briefly before hiding
    const id = window.setTimeout(() => setVisible(false), 250);
    return () => window.clearTimeout(id);
  }, [isLoading]);

  if (!visible) return null;
  return <div className="route-progress" aria-hidden="true" />;
}
