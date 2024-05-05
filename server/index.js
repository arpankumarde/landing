import express from "express";
import { createReadStream, statSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/video", (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  const filepath = `${__dirname}/public/video.mp4`;
  const fileStat = statSync(filepath);
  const fileSize = fileStat.size;

  const chunkSize = 10 ** 6; //1mb

  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, fileSize - 1);
  const contentLength = end - start + 1;

  const fileStream = createReadStream(filepath, {
    highWaterMark: 2 ** 16,
    start,
    end,
  });

  fileStream.pipe(res);

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
