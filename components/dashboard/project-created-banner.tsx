"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";

export function ProjectCreatedBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get("created") !== "1") {
      return;
    }

    params.delete("created");
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <Card className="rounded-[30px] border border-emerald-200 bg-emerald-50">
      <h2 className="text-xl font-semibold text-emerald-950">Project created successfully</h2>
      <p className="mt-3 text-sm leading-7 text-emerald-800">
        Your new project is ready. You can now upload files, run evaluations, and continue in this workspace.
      </p>
    </Card>
  );
}
