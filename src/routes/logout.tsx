import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  useEffect(() => {
    // Limpa a sessão do localStorage
    try { localStorage.removeItem("aegis_session"); } catch {}
    try { sessionStorage.clear(); } catch {}

    // Notifica o servidor para expirar o cookie também
    fetch("/auth/logout-server", { method: "POST", credentials: "include" })
      .catch(() => {})
      .finally(() => {
        window.location.replace("/");
      });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#30363d] border-t-blue-500 mx-auto mb-4" />
        <p className="text-[#7d8590] text-sm">Saindo...</p>
      </div>
    </div>
  );
}
