import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("ScholarDesk123!", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@scholardesk.ai" },
    update: {
      name: "Demo Student",
      role: "student",
      plan: "pro"
    },
    create: {
      name: "Demo Student",
      email: "demo@scholardesk.ai",
      passwordHash,
      role: "student",
      plan: "pro"
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@scholardesk.ai" },
    update: {
      name: "ScholarDesk Admin",
      role: "admin",
      plan: "team"
    },
    create: {
      name: "ScholarDesk Admin",
      email: "admin@scholardesk.ai",
      passwordHash,
      role: "admin",
      plan: "team"
    }
  });

  const existingProject = await prisma.project.findFirst({
    where: {
      userId: demoUser.id,
      title: "International Business Strategy Essay"
    }
  });

  const project =
    existingProject ??
    (await prisma.project.create({
      data: {
        userId: demoUser.id,
        title: "International Business Strategy Essay",
        school: "Demo University",
        module: "BUS702",
        assignmentType: "essay",
        language: "en",
        status: "active",
        tags: {
          create: [{ label: "strategy" }, { label: "business" }, { label: "demo" }]
        }
      }
    }));

  const existingFile = await prisma.uploadedFile.findFirst({
    where: {
      projectId: project.id,
      filename: "sample-brief.md"
    }
  });

  const file =
    existingFile ??
    (await prisma.uploadedFile.create({
      data: {
        projectId: project.id,
        filename: "sample-brief.md",
        mimeType: "text/markdown",
        storagePath: "local://demo/sample-brief.md",
        extractedText:
          "Discuss market entry strategy for a UK-based company expanding into Southeast Asia. Demonstrate evidence-based reasoning, use a clear academic structure, and maintain Harvard referencing conventions.",
        extractionStatus: "completed",
        embeddingStatus: "pending"
      }
    }));

  const existingChunk = await prisma.documentChunk.findFirst({
    where: {
      fileId: file.id,
      chunkIndex: 0
    }
  });

  if (!existingChunk) {
    await prisma.documentChunk.create({
      data: {
        fileId: file.id,
        content:
          "Discuss market entry strategy for a UK-based company expanding into Southeast Asia. Demonstrate evidence-based reasoning, use a clear academic structure, and maintain Harvard referencing conventions.",
        chunkIndex: 0,
        tokenCount: 32
      }
    });
  }

  const existingReport = await prisma.evaluationReport.findFirst({
    where: { projectId: project.id }
  });

  if (!existingReport) {
    await prisma.evaluationReport.create({
      data: {
        projectId: project.id,
        overallScore: 74,
        jsonReport: {
          overallSummary:
            "The draft has a workable structure and a recognizably academic tone, but the argument needs tighter evidence handling and more explicit evaluation.",
          dimensionScores: {
            structure: 74,
            argument: 68,
            evidenceUse: 66,
            citationQuality: 70,
            languageClarity: 79,
            academicTone: 77
          },
          strengths: [
            "The draft maintains a recognizably academic tone throughout.",
            "Paragraph openings usually signal the intended topic clearly.",
            "The conclusion returns to the stated question rather than ending abruptly."
          ],
          priorityImprovements: [
            "Strengthen the line of argument between descriptive evidence and evaluative claims.",
            "Use cited material more selectively and explain why each source matters.",
            "Tighten transitions so each paragraph clearly advances the central claim."
          ],
          revisionChecklist: [
            "Rewrite the introduction so the research focus and argument are explicit.",
            "Check whether each body paragraph contains claim, evidence, and interpretation.",
            "Remove repetitive summary sentences that do not add analysis.",
            "Standardize in-text citation formatting before final review."
          ],
          citationFeedback: [
            "The citation style is mostly recognizable but still needs consistency checks.",
            "A final reference-list sweep is recommended before submission."
          ],
          grammarStyleNotes: [
            "Sentence control is mostly clear, but a few paragraphs become too dense.",
            "There is room to cut filler phrasing and improve precision."
          ],
          academicToneNotes: [
            "The tone is generally formal enough for higher-education writing.",
            "Some claims would feel stronger with more cautious analytical wording."
          ],
          optionalExamples: [
            "Open body paragraphs with a claim that names the analytical function of the section."
          ],
          sourcesUsed: []
        }
      }
    });
  }

  await prisma.adminSetting.upsert({
    where: { key: "featureFlags.paperEvaluation" },
    update: { value: "true" },
    create: {
      key: "featureFlags.paperEvaluation",
      value: "true"
    }
  });

  await prisma.adminSetting.upsert({
    where: { key: "featureFlags.appealOrganizer" },
    update: { value: "true" },
    create: {
      key: "featureFlags.appealOrganizer",
      value: "true"
    }
  });

  await prisma.promptTemplate.upsert({
    where: { key: "evaluation-default" },
    update: {
      title: "Evaluation default prompt",
      prompt: "Evaluate the paper using the rubric and retrieved evidence."
    },
    create: {
      key: "evaluation-default",
      title: "Evaluation default prompt",
      prompt: "Evaluate the paper using the rubric and retrieved evidence."
    }
  });

  console.log("ScholarDesk AI seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
