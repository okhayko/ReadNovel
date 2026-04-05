import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API route for Edge TTS
  app.post("/api/tts", async (req, res) => {
    const { text, voice, rate } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).send("Text is required.");
    }

    const maxRetries = 2;
    let attempt = 0;

    const generateAudio = async () => {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice || "vi-VN-HoaiMyNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      
      const ratePercent = rate >= 1 
        ? `+${Math.round((rate - 1) * 100)}%` 
        : `-${Math.round((1 - rate) * 100)}%`;

      const escapedText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN"><voice name="${voice || "vi-VN-HoaiMyNeural"}"><prosody rate="${ratePercent}">${escapedText}</prosody></voice></speak>`;
      
      // Use SSML if rate is not 1.0, otherwise plain text
      return await tts.toStream(rate === 1.0 ? text : ssml);
    };

    const trySend = async () => {
      try {
        const { audioStream } = await generateAudio();
        
        let bytesSent = 0;
        let hasError = false;

        res.set({
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=3600"
        });

        audioStream.on('data', (chunk) => {
          bytesSent += chunk.length;
        });

        audioStream.pipe(res);

        audioStream.on('end', () => {
          if (bytesSent === 0 && !hasError) {
            console.warn(`Attempt ${attempt + 1}: Sent 0 bytes for text: ${text.substring(0, 20)}...`);
            if (attempt < maxRetries) {
              attempt++;
              // We can't retry easily after headers are sent, 
              // but if 0 bytes were sent, maybe we can try again if we haven't piped yet?
              // Actually, pipe starts immediately. 
            }
          }
        });

        audioStream.on('error', (err) => {
          hasError = true;
          console.error("Audio stream error:", err);
          if (!res.headersSent) {
            res.status(500).send("Error streaming audio.");
          }
        });

      } catch (err) {
        console.error(`TTS Attempt ${attempt + 1} failed:`, err);
        if (attempt < maxRetries) {
          attempt++;
          setTimeout(trySend, 500 * attempt);
        } else if (!res.headersSent) {
          res.status(500).send("Error generating speech after retries.");
        }
      }
    };

    trySend();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
