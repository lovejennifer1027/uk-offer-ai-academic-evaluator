"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="luxury-button-muted text-sm"
      disabled={isPending}
      onClick={async () => {
        await fetch("/api/admin/session", {
          method: "DELETE"
        });

        startTransition(() => {
          router.refresh();
        });
      }}
    >
      {isPending ? "退出中..." : "退出后台"}
    </button>
  );
}
