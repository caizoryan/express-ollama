import fs from "fs";
export const writeFileTool = {
  name: "write_file",
  description: "Create a file with the provided content.",
  parameters: {
    type: "object",
    properties: {
      file_path: { type: "string", description: "Absolute or relative file path." },
      content: { type: "string", description: "Content to write into the file." },
    },
    required: ["file_path", "content"]
  }
}

export const readFileTool = {
  name: "read_file",
  description: "Read the contents of a file from the local filesystem.",
  parameters: {
    type: "object",
    properties: {
      file_path: { type: "string", description: "Path to the file to read." },
    },
    required: ["file_path"]
  }
};

export function readFile({ file_path, encoding = "utf-8" }) {
  try {
    const content = fs.readFileSync(file_path, encoding);
    return {
      success: true,
      content
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export function writeFile({ file_path, content, encoding = "utf-8" }) {
  try {
    fs.writeFileSync(file_path, content, encoding);
    return {
      success: true,
      bytesWritten: Buffer.byteLength(content, encoding)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
