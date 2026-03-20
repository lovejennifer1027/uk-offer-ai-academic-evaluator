import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError, HttpError } from "@/lib/http";
import { requireSessionUser } from "@/lib/session";
import { generateKnowledgeAnswer } from "@/services/ai/report-service";
import { createChatMessage, createChatThread, getProjectByIdForUser, listThreadsByProject } from "@/services/store/local-store";

const schema = z.object({
  projectId: z.string().min(1),
  question: z.string().min(3),
  language: z.enum(["en", "zh", "bilingual"])
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json());
    const project = await getProjectByIdForUser(payload.projectId, user.id);

    if (!project) {
      throw new HttpError("Project not found.", 404);
    }

    const threads = await listThreadsByProject(project.id);
    const thread = threads[0] ?? (await createChatThread({ projectId: project.id, title: "Workspace chat" }));

    await createChatMessage({
      threadId: thread.id,
      role: "user",
      content: payload.question,
      citationsJson: []
    });

    const answer = await generateKnowledgeAnswer({
      projectId: project.id,
      question: payload.question,
      language: payload.language
    });

    await createChatMessage({
      threadId: thread.id,
      role: "assistant",
      content: answer.answer,
      citationsJson: answer.sourcesUsed
    });

    return NextResponse.json(answer);
  } catch (error) {
    return handleApiError("chat-route", error, "Chat request failed.");
  }
}
