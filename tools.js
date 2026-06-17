import fs from "fs";

const withErrorHandling = (fn) => (...args) => {
  try {
    return { success: true, content: fn(...args) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createTool = ({name, description, parameters}) => ({
  type: 'function',
  function: { name, description, parameters }
});

export const readFileTool = {
  name: "read",
  description: "Read the contents of a file from the local filesystem.",
  parameters: {
    type: "object",
    properties: { file_path: { type: "string", description: "Path to the file to read." } },
    required: ["file_path"]
  },
  execute: withErrorHandling(({ file_path }) => {
    return  fs.readFileSync(file_path, {encoding:'utf-8'}) ;
  })
};

export const writeFileTool = {
  name: "write",
  description: "Create a file with the provided content.",
  parameters: {
    type: "object",
    properties: {
      file_path: { type: "string", description: "Absolute or relative file path." },
      content: { type: "string", description: "Content to write into the file." },
    },
    required: ["file_path", "content"]
  },
  execute: withErrorHandling(({ file_path, content }) => {
    fs.writeFileSync(file_path, content);
    return  `bytesWritten: ${Buffer.byteLength(content)}` ;
  })
};

export const listFilesTool = {
  name: "list",
  description: "List the contents of a directory from the local filesystem.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "Path to the directory to list." },
    },
    required: ["path"]
  },
  execute: withErrorHandling(({ path }) => {
    return fs.readdirSync(path, {withFileTypes: true})
        .map(e => e.isDirectory() ? `${e.name}/` : e.name)
        .join("\n") 
  })
};

export let tools = [readFileTool, listFilesTool, writeFileTool]

export function toolToMarkdown(tool) {
  let markdown = `## ${tool.name}\n`;
  markdown += `**Description:** ${tool.description}\n\n`;
  markdown += "**Parameters:**\n";
  
  for (const [param, details] of Object.entries(tool.parameters.properties)) {
    markdown += `- **${param}** (${details.type}): ${details.description}\n`;
    if (tool.parameters.required.includes(param)) {
      markdown += `  - *Required*\n`;
    }
  }
  
  return markdown;
}
