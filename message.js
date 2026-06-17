import { tools, toolToMarkdown } from './tools.js'

let toolMsg = `
### Remember you have tool calls available to you: 

${tools.map(toolToMarkdown).join("\n")}

Correctly check the parameters required for the calls. read_file and write_file both take a 'file_path' parameter.`

export let messages = [
	{ role: 'system', content: `
You are an intelligent coding agent. You think step by step and follow instructions.

${toolMsg}

Answer succinctly. Only explain when absolutely necessary. Much of the things can be inferred.
Be succinct with your code and make sure the context is taken into account.
`},
]
