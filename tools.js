const fs = require("fs");

async function ocrImage(imagePath) {
  const imageBase64 = fs.readFileSync(imagePath, {
    encoding: "base64",
  });

  const response = await fetch("http://100.85.209.5:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3.5:9b", // or gemma3, etc.
      stream: false,
      think: false,
      messages: [
        {
          role: "user",
          content:
            "Perform OCR on this image. Return all visible text exactly as written.",
          images: [imageBase64],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  console.log("OCR Result:");
  console.log(result.message.content);

  return result.message.content;
}

ocrImage("./image.png")
  .then(() => console.log("Done"))
  .catch(console.error);
