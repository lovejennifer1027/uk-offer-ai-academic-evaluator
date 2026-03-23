import AnalyzeBriefWorkspace from "@/components/dashboard/AnalyzeBriefWorkspace";
import { requireSessionUser } from "@/lib/session";

export default async function AnalyzeBriefPage() {
  await requireSessionUser();

  return <AnalyzeBriefWorkspace />;
}
