import { readFile, writeFile } from './tools.js'
import { messages } from './message.js'

const REQUIRED_ARGS = {
  read_file: ['file_path'],
  write_file: ['file_path', 'content'],
}

const TOOL_FUNCTIONS = {
  read_file: (args) => {
    const output = readFile(args)
    return output.success ? output.content : output.error
  },
  write_file: (args) => {
    writeFile(args)
    return 'success'
  },
}

export function callFunction(toolCall, part, loopAround) {
  const name = toolCall.function.name
  const args = toolCall.function.arguments

  console.log('Dawg wants to call: ', name)

  if (!TOOL_FUNCTIONS[name]) {
    console.log(`Unknown tool: ${name}`)
    return
  }

  // Validate required args
  const requiredArgs = REQUIRED_ARGS[name] ?? []
  for (const arg of requiredArgs) {
    if (!args[arg]) {
      messages.push({
        role: 'user',
        content: `Tool call failed because argument '${arg}' was not there. If you used a different parameter name, re-do tool call with '${arg}' as argument`
      })
      return
    }
  }

  loopAround()
  messages.push(part.message)
  console.log(`wants to call ${name}...`, args)

  const result = TOOL_FUNCTIONS[name](args)

  messages.push({
    role: 'tool',
    tool_name: name,
    content: result,
  })
}
