import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Telegram Bot API proxy endpoint
  // Allows the frontend to safely invoke Telegram Bot API methods without CORS issues
  app.post("/api/telegram/proxy", async (req, res) => {
    try {
      const { botToken, method, params } = req.body;

      if (!botToken || !method) {
        return res.status(400).json({
          ok: false,
          description: "botToken and method are required",
        });
      }

      // Sanitize token format: e.g., 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ
      const cleanToken = botToken.trim();
      const telegramUrl = `https://api.telegram.org/bot${cleanToken}/${method}`;

      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params || {}),
      });

      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (error: any) {
      console.error("Telegram proxy error:", error);
      return res.status(500).json({
        ok: false,
        description: error.message || "Failed to communicate with Telegram API",
      });
    }
  });

  // Sample webhook echo endpoint if user wants to test live webhooks
  app.post("/api/telegram/webhook/:botToken", (req, res) => {
    const { botToken } = req.params;
    const update = req.body;
    console.log(`[Webhook Received for bot ${botToken.slice(0, 8)}...]:`, JSON.stringify(update, null, 2));
    
    // Always respond 200 OK to Telegram
    res.status(200).json({ ok: true });
  });

  // Vite middleware for development vs static serve for production
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Telegram Bot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
