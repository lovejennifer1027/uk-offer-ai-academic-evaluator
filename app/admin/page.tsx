import Link from "next/link";
import { redirect } from "next/navigation";

import { FAQS, FEATURES, PRICING_TIERS } from "@/config/site";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOptionalSessionUser } from "@/lib/session";
import { getAdminSnapshot } from "@/services/store/local-store";

export default async function AdminPage() {
  const user = await getOptionalSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  const snapshot = await getAdminSnapshot();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f5f7ff_0%,#fafbff_100%)] px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="rounded-[30px]">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Admin panel</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Users, projects, files, reports, feature flags, prompt templates, and content blocks are surfaced here for role-based review.</p>
          <div className="mt-5">
            <Link href="/admin/academic-knowledge">
              <Button variant="secondary">Open school knowledge backend</Button>
            </Link>
          </div>
        </Card>

        <div className="grid gap-6">
          <AdminDataTable
            title="Users"
            columns={["Name", "Email", "Role", "Plan"]}
            rows={snapshot.users.map((user) => [user.name, user.email, user.role, user.plan])}
          />
          <AdminDataTable
            title="Projects"
            columns={["Title", "School", "Module", "Status"]}
            rows={snapshot.projects.map((project) => [project.title, project.school, project.module, project.status])}
          />
          <AdminDataTable
            title="Files"
            columns={["Filename", "Type", "Extraction", "Embedding"]}
            rows={snapshot.files.map((file) => [file.filename, file.mimeType, file.extractionStatus, file.embeddingStatus])}
          />
          <AdminDataTable
            title="School knowledge files"
            columns={["School", "Filename", "Extraction", "Embedding"]}
            rows={snapshot.schoolKnowledgeFiles.map((file) => [file.schoolName, file.filename, file.extractionStatus, file.embeddingStatus])}
          />
          <AdminDataTable
            title="Reports"
            columns={["Project", "Overall score", "Created"]}
            rows={snapshot.reports.map((report) => [report.projectId, report.overallScore, report.createdAt])}
          />
          <AdminDataTable
            title="Feature flags"
            columns={["Key", "Value", "Updated"]}
            rows={snapshot.settings.map((setting) => [setting.key, setting.value, setting.updatedAt])}
          />
          <AdminDataTable
            title="Prompt templates"
            columns={["Key", "Title", "Updated"]}
            rows={snapshot.promptTemplates.map((template) => [template.key, template.title, template.updatedAt])}
          />
          <AdminDataTable
            title="Homepage content blocks"
            columns={["Type", "Key", "Preview"]}
            rows={[
              ...FEATURES.map((feature) => ["Feature", feature.key, feature.title.en]),
              ...FAQS.map((faq, index) => ["FAQ", `faq-${index + 1}`, faq.question.en]),
              ...PRICING_TIERS.map((tier) => ["Pricing", tier.key, tier.name.en])
            ]}
          />
        </div>
      </div>
    </div>
  );
}
