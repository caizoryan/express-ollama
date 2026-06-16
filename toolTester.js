// import { listFiles } from "./tools.js";
//
// console.log(listFiles({path: './todo'}))
//
import fs from 'fs'
import { includes } from 'zod';

function readFileRange(filePath, fromLine, toLine) {
  const content = fs.readFileSync(filePath, {encoding: 'utf8'}).split('\n');
  
  if (fromLine < 1) return [];

  
  const startIndex = Math.max(0, fromLine - 1); // Convert line number to index
  const end = Math.min(content.length, toLine + 1);
  
  return content.slice(startIndex, end).join('\n');
}

console.log(
	readFileRange(`./toolTester.js`, 8, 22-4)
)
