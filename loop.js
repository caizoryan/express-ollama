import { Ollama } from 'ollama'
import { readFileTool, writeFileTool } from './tools.js'
import { callFunction } from './callFunction.js'

const ollama = new Ollama({ 
  host: 'http://100.85.209.5:11434'
})

let messages = [
	{ role: 'system', content: `
You are an intelligent coding agent. You think systematically and follow instructions.
Remember you have tool calls available to you, read_file and write_file are available to you.
Correctly check the parameters required for the calls. read_file and write_file both take a 'file_path' parameter.` },
	{ role: 'user', content: `` }
]

let running = true


while (running) {
	let loopAround = false

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
			part.message.tool_calls.forEach(callFunction)
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


