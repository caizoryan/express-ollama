#!/usr/bin/env node

import { Ollama } from 'ollama'
import { auth } from './auth.js'
import { createTool, tools } from './tools.js'
import { callFunction } from './callFunction.js'
import { messages } from './message.js'
import fs from 'fs'
import { parse } from './minimist.js'

let models = { 
	lfm: 'lfm2.5:8b',
	qwen0b: 'qwen3.5:4b',
	qwen4b: 'qwen3.5:4b',
	qwen9b: 'qwen3.5:9b',
	qwen27b: 'qwen3.6:27b',
	gemma4b: 'gemma4:e4b',
	gemma12b: 'gemma4:12b',
}

let currentModel = models.gemma4b
let using = 'zAPI'

const ollama = new Ollama({ 
  host: 'http://100.85.209.5:11434'
})

async function callZAPI(messages, onPart) {
	const res = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${auth}`,
			},
			body: JSON.stringify({
				// model: 'GLM-4.5-Air',
				// model: 'GLM-4.5-Flash',
				 model: 'GLM-4-32B-0414-128K',
				// model: 'GLM-4.7',
				// model: 'GLM-4.7-Flash',

				messages,
				stream: true,
				// top_p: 0.4,
				tools: tools.map(createTool),
			}),
		})

		if (!res.ok) console.log("ERROR: ", res)

		const reader = res.body.getReader()
		const decoder = new TextDecoder()
		let buffer = ''

		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			buffer += decoder.decode(value, { stream: true })

			const lines = buffer.split('\n')
			buffer = lines.pop()

			for (const line of lines) {
				const trimmed = line.trim()
				if (!trimmed.startsWith('data:')) continue
				const data = trimmed.slice(5).trim()
				if (data === '[DONE]') return

				const json = JSON.parse(data)
				const delta = json.choices[0].delta

				// if (delta.content) process.stdout.write(delta.content)

				onPart({
					message: {
						content: delta.content || '',
						tool_calls: delta.tool_calls || null,
					},
				})
			}
		}
}

let estimateTokens = (text) => Math.ceil(text.length / 4);
let running = false
let iterations = 0
let start = new Date()

let parsed = parse(process.argv, {
	boolean: ['r', 'running'],
	alias: 
	{
		s: 'session',
		p: 'prompt',
		r: 'running',
		l: 'list',
	}
})

if (parsed.running) {
	running = true
}

if (parsed.list) {
	const sessionPath = `/Users/aaryan/.llm_sessions/`
	console.log(
		fs.readdirSync(sessionPath, {withFileTypes: true})
			.map(e => e.isDirectory() ? undefined : e.name)
			.filter(e => e!=undefined)
			.join("\n")
	)
}

let loadSession = sessionPath => {
		try {
				const sessionData = fs.readFileSync(sessionPath, 'utf8');
				const sessionMessages = JSON.parse(sessionData);
				if (Array.isArray(sessionMessages)) {
						sessionMessages.forEach(message => messages.push(message));
				}
		} catch (error) {
			console.log("Session File don't exist or smth")
		}
}

if (parsed.session) {
	const sessionPath = `/Users/aaryan/.llm_sessions/${parsed.session}.json`;
	loadSession(sessionPath)
}

if (parsed.prompt) {
	messages.push({
		role: 'user',
		content: parsed.prompt
	})
}

console.log('\n')
console.log('---- started : ', start.toTimeString().slice(0,8))


while (running) {
	iterations++
	let loopAround = false
	let success = () => loopAround = true
	let respondedContent = ''

	if (using == 'zAPI'){
		await callZAPI(messages, (part) => {
			if (part.message.tool_calls) {
				part.message.tool_calls.forEach((toolCall) => callFunction(toolCall, part, success))
			}
			respondedContent += part.message.content
			process.stdout.write(part.message.content)
		})

	}

	else {
		// Z api
		//
		const response = await ollama.chat({
			tools: [readFileTool, writeFileTool, listFilesTool],
			model: currentModel,
			messages,
			think: "low",
			stream: true,
		})

		// Ollama
		for await (const part of response) {
			if (part.message.tool_calls) {
				part.message.tool_calls.forEach((toolCall) => callFunction(toolCall, part, success))
			}
			// process.stdout.write(JSON.stringify(part))
			// process.stdout.write("\n")
			respondedContent += part.message.content
			process.stdout.write(part.message.content)
		}
	}

	if (respondedContent != '') messages.push({
		role: 'assistant',
		content: respondedContent
	})

	if (!loopAround || iterations > 10) running = false
}

let end = new Date()

console.log('\n')
console.log('==finished : ', end.toTimeString().slice(0,8) , '==')
console.log(`===time taken :`, (end - start) /1000 , '==')

let log = JSON.stringify(messages)
fs.writeFileSync(`/Users/aaryan/.llm_sessions/${parsed.session ? parsed.session : 'log'}.json`, log)

console.log("\nDONE")


