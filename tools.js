const response = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        model: "qwen3.5:0.8b",
        think: false,
        stream: true, // enable streaming
        messages: [
            {
                role: "user",
                content: "A js function for fibonacci number.",
            },
        ],
    }),
});

if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();

let fullContent = "";

while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // Each chunk may contain multiple newline-separated JSON objects
    const lines = decoder.decode(value, { stream: true }).split("\n").filter(Boolean);

    for (const line of lines) {
        const chunk = JSON.parse(line);

        if (chunk.message?.content) {
            fullContent += chunk.message.content;
            process.stdout.write(chunk.message.content); // print token as it arrives
        }

        // chunk.done === true means the stream is finished
        if (chunk.done) {
            console.log("\n--- Stream complete ---");
            // chunk.eval_count, chunk.prompt_eval_count etc. are available here
        }
    }
}
