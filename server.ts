import express from "express";
import path from "path";
import dotenv from "dotenv";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

dotenv.config();

async function startServer() {
  try {
    const app = express();
    app.use(express.json());
    
    // Khắc phục 1: Lấy Port từ môi trường Render, nếu chạy local thì dùng 3000
    const PORT = process.env.PORT || 3000;

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
              console.warn(`Attempt ${attempt + 1}: Sent 0 bytes for text`);
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

    // Cấu hình Serve Frontend
    if (process.env.NODE_ENV !== "production") {
      // Khắc phục 2: Import động (Dynamic import) Vite để tránh lỗi OOM trên server Production
      const { createServer: createViteServer } = await import("vite");
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
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // Bắt lỗi khởi tạo server nếu có
    console.error("Lỗi khi khởi động ứng dụng:", error);
    process.exit(1);
  }
}

startServer();
