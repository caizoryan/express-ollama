#!/usr/bin/env node

import { Ollama } from 'ollama'
import { auth } from './auth.js'
import { createTool, tools } from './tools.js'
import { callFunction } from './callFunction.js'
import { messages } from './message.js'
import fs from 'fs'

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

let running = true
let iterations = 0
let start = new Date()

function readFileRange(filePath, fromLine, toLine) {
	let content = fs.readFileSync(filePath, {encoding: 'utf8'})

	if (!fromLine || fromLine < 1) return content;

	content = content.split('\n');


	const startIndex = Math.max(0, parseInt(fromLine) - 1); // Convert line number to index
	const end = parseInt(toLine) + 1;

	return content.slice(startIndex, end).join('\n');
}

export const replaceTemplate = (inputString) => {
	const tokens=inputString.split(' ');
	const prefix='/readfile:';
	let modelPrefix = '/model:'; // Defined explicitly for clarity
	let resultString='';

	for (const token of tokens){

		if (token.includes(modelPrefix)){
			const startIndex = token.indexOf(modelPrefix);
			let modelNameCandidate = token.substring(startIndex + modelPrefix.length).trim();

			if (models[modelNameCandidate]) {
				const newModelKey = modelNameCandidate;
				if (currentModel !== models[newModelKey]) {
					console.log(`Setting current model from ${currentModel} to ${models[newModelKey]} based on input token.`);
					currentModel = models[newModelKey];
				}
			}
		}

		else if (token.includes(prefix)){
			const startIndex = token.indexOf(prefix);
			let before = token.slice(0, startIndex)
			let filePath = token.substring(startIndex + prefix.length).trim();

			if (filePath){
				let lineStart = -1
				let lineEnd = -1
				// check if there is a line numbers
				try {
					let split = filePath.split(':')
					if (split.length > 1){
						filePath = split[0]
						let numbers = split[1].split('-')
						lineStart = numbers[0]
						lineEnd = numbers[1]
					}
					const fileContent = readFileRange(filePath, lineStart, lineEnd);
					resultString += (before + fileContent)
				} catch(error){
					console.error(`Errorreadingfile${filePath}:`,error);
					resultString+=`[ERRORREADINGFILE:${filePath}]`;
				}
			}
		} else {
			resultString+=token + " ";
		}
	}

	return resultString;
};

if (process.argv[2]) {
	messages.push({
		role: 'user',
		content: replaceTemplate(process.argv[2])
		// content: (process.argv[2])
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
fs.writeFileSync('/Users/aaryan/.llm_sessions/log.json', log)

console.log("\nDONE")


