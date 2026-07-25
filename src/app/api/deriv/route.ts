import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let ws: WebSocket | null = null;
      let closed = false;

      const send = (data: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // stream already closed
        }
      };

      try {
        // Connect to Deriv using public App ID
        ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

        ws.onopen = () => {
          send({ type: "status", status: "connected" });

          // Subscribe to Volatility 10 Index
          ws?.send(JSON.stringify({
            ticks: "R_10",
            subscribe: 1
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as string);

            if (data.msg_type === "tick" && data.tick) {
              send({
                type: "tick",
                quote: data.tick.quote,
                epoch: data.tick.epoch,
                symbol: data.tick.symbol
              });
            }

            if (data.error) {
              send({ type: "error", message: data.error.message });
            }
          } catch (err) {
            // ignore parse errors
          }
        };

        ws.onclose = () => {
          send({ type: "status", status: "disconnected" });
          if (!closed) {
            // Try to close the stream
            try {
              controller.close();
            } catch (e) {}
          }
        };

        ws.onerror = () => {
          send({ type: "error", message: "WebSocket error" });
        };

        // Clean up when client disconnects
        request.signal.addEventListener("abort", () => {
          closed = true;
          if (ws) {
            ws.close();
          }
          try {
            controller.close();
          } catch (e) {}
        });

      } catch (err: any) {
        send({ type: "error", message: err.message || "Connection failed" });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}