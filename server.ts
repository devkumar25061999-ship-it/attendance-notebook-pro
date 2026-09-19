import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Attendance Notebook Pro Live Voice" });
  });

  // REST Chat fallback endpoint for Suman
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const { message, history } = req.body;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const systemInstruction = 
        "You are Suman (सुमन), a warm, sweet, and caring female voice assistant for Attendance Notebook Pro (हाजिरी और काम डायरी ऐप). " +
        "You speak in sweet, polite Hindi/Hinglish (or English if requested). " +
        "Always be very respectful, helpful, and pleasant. Introduce yourself as Suman (सुमन) if the user asks or greets. " +
        "Help with attendance, salary calculations, daily work diary, overtime hours, and motivation. " +
        "Keep responses brief, conversational, and warm.";

      const chat = ai.chats.create({
        model: "gemini-3.8-flash",
        config: {
          systemInstruction,
        },
      });

      const response = await chat.sendMessage({ message: message || "नमस्ते सुमन" });
      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Chat API error:", err);
      return res.status(500).json({ error: err?.message || "Failed to generate response" });
    }
  });

  // WebSocket Server for Gemini Live API
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
    if (pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("Client connected to Suman Live Voice session");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(JSON.stringify({ error: "Gemini API key is not configured on the server." }));
      clientWs.close();
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    let liveSession: any = null;

    try {
      // Model: gemini-3.8-live, sweet female voice: 'Kore'
      liveSession = await ai.live.connect({
        model: "gemini-3.8-live",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: "Kore", // Sweet female voice
              },
            },
          },
          systemInstruction:
            "You are Suman (सुमन), a warm, pleasant, and sweet female voice assistant for Attendance Notebook Pro (हाजिरी और काम डायरी ऐप). " +
            "Your personality is polite, sweet, friendly, and respectful. " +
            "You speak naturally in sweet Hindi/Hinglish (and English if spoken to in English). " +
            "When the user greets you or asks your name, introduce yourself happily as Suman ('नमस्ते! मैं सुमन हूँ, आपकी डिजिटल साथी।'). " +
            "Assist users with checking daily attendance, counting work days, calculating overtime, recording notes in the diary, and answering attendance rules. " +
            "Keep your spoken answers concise, conversational, and sweet.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts && parts.length > 0) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
                }
                if (part.text) {
                  clientWs.send(JSON.stringify({ text: part.text }));
                }
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            console.log("Gemini live session closed");
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ status: "disconnected" }));
            }
          },
          onerror: (err) => {
            console.error("Gemini live session error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ error: err?.message || "Live API error" }));
            }
          },
        },
      });

      clientWs.send(JSON.stringify({ status: "ready", assistantName: "Suman" }));

      clientWs.on("message", (raw) => {
        try {
          const data = JSON.parse(raw.toString());
          if (data.audio && liveSession) {
            // Realtime 16kHz PCM audio chunk from microphone
            liveSession.sendRealtimeInput({
              audio: {
                data: data.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } else if (data.text && liveSession) {
            liveSession.send({
              clientContent: {
                turns: [
                  {
                    role: "user",
                    parts: [{ text: data.text }],
                  },
                ],
                turnComplete: true,
              },
            });
          }
        } catch (err) {
          console.error("Failed to parse client message:", err);
        }
      });

      clientWs.on("close", () => {
        if (liveSession) {
          try {
            liveSession.close();
          } catch (_) {}
        }
      });
    } catch (err: any) {
      console.error("Failed to establish Gemini Live connection:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err?.message || "Unable to start voice session with Suman." }));
        clientWs.close();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
