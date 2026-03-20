import { requireAdminApiAuth } from "@/lib/admin/auth";
import { LIBRARY_SYNC_EVENTS_POLL_MS } from "@/lib/library/constants";
import { getLibraryStatus } from "@/lib/library/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApiAuth(request);
  if (unauthorized) {
    return unauthorized;
  }

  const encoder = new TextEncoder();
  let closed = false;
  let interval: ReturnType<typeof setInterval> | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const sendSnapshot = async () => {
        if (closed) {
          return;
        }

        try {
          const status = await getLibraryStatus();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ timestamp: new Date().toISOString(), status })}\n\n`)
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown status error"
              })}\n\n`
            )
          );
        }
      };

      void sendSnapshot();
      interval = setInterval(() => {
        void sendSnapshot();
      }, LIBRARY_SYNC_EVENTS_POLL_MS);
      timeout = setTimeout(() => {
        closed = true;
        if (interval) {
          clearInterval(interval);
        }
        if (timeout) {
          clearTimeout(timeout);
        }
        controller.close();
      }, 30000);
    },
    cancel() {
      closed = true;
      if (interval) {
        clearInterval(interval);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
