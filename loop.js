import { Ollama } from 'ollama'
import { readFileTool, writeFileTool } from './tools.js'
import { callFunction } from './callFunction.js'
import { messages } from './message.js'

const ollama = new Ollama({ 
  host: 'http://100.85.209.5:11434'
})


let running = true

while (running) {
	let loopAround = false
	let success = () => loopAround = true

	const response = await ollama.chat({
		tools: [readFileTool, writeFileTool],
		model: 'qwen3.5:9b',
		messages,
		think: "medium",
		stream: true,
	})

	let respondedContent = ''

	for await (const part of response) {
		if (part.message.tool_calls) {
			part.message.tool_calls.forEach((toolCall) => callFunction(toolCall, part, success))
		}
		// process.stdout.write(JSON.stringify(part))
		// process.stdout.write("\n")
		respondedContent += part.message.content
		process.stdout.write(part.message.content)
	}

	messages.push({
		role: 'assistant',
		content: respondedContent
	})

	if (!loopAround) running = false
}

console.log("\nDONE")


