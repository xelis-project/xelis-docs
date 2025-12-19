#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, '../resources/standard-library/doc_out.json');
const outputPath = path.join(__dirname, '../content/features/smart-contracts/standard-library.mdx');

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Generate MDX content
let mdxContent = `---
title: Silex Standard Library
---

# Silex Standard Library (Built-in Functions)

This document describes the built-in functions available in Silex. These functions are automatically available in your Silex code and can be invoked on the appropriate types (Arrays, Strings, Maps, etc.) or as static functions (e.g., \`Block::current()\`).

Please note:

- **Gas Cost**: Each function consumes a certain amount of gas when invoked. The gas cost is indicated below next to each function. But some functions can apply an additional dynamic gas.
- **Optional Return**: Some functions can return a value or \`null\` when the value is absent.
- **Type Parameters**: Some functions use a type variable \`T(0)\`, \`T(1)\` (like in arrays or maps) simply meaning "whatever element type" your array or map uses.

`;

// Helper function to escape generic types inside backticks but preserve HTML tags
function escapeForMDX(text) {
  if (!text) return text;
  
  // List of valid HTML tags that should NOT be escaped
  const validHtmlTags = ['br', 'code', 'signature', 'strong', 'em', 'span', 'div', 'p'];
  
  // Process text to escape generics inside backticks
  let result = '';
  let inBacktick = false;
  let buffer = '';
  
  for (let i = 0; i < text.length; i++) {
	const char = text[i];
	
	if (char === '`') {
	  if (inBacktick) {
		// End of backtick - escape generics in buffer
		const escaped = buffer.replace(/<([^>]+?)>/g, (match, content) => {
		  const tagName = content.replace(/\/$/, '').replace(/^\//, '').split(/\s/)[0];
		  if (validHtmlTags.includes(tagName)) {
			return match;
		  }
		  return `\\<${content}\\>`;
		});
		result += '`' + escaped + '`';
		buffer = '';
		inBacktick = false;
	  } else {
		// Start of backtick
		inBacktick = true;
		buffer = '';
	  }
	} else if (inBacktick) {
	  buffer += char;
	} else {
	  // Outside backticks - check for HTML tags only
	  if (char === '<') {
		let tagEnd = text.indexOf('>', i);
		if (tagEnd !== -1) {
		  const tagContent = text.substring(i + 1, tagEnd);
		  const tagName = tagContent.replace(/\/$/, '').replace(/^\//, '').split(/\s/)[0];
		  if (validHtmlTags.includes(tagName)) {
			// Valid HTML tag - keep as is
			result += text.substring(i, tagEnd + 1);
			i = tagEnd;
		  } else {
			result += char;
		  }
		} else {
		  result += char;
		}
	  } else {
		result += char;
	  }
	}
  }
  
  return result;
}

// Generate content for each category
data.forEach(category => {
  mdxContent += `## ${category.name} Functions\n\n`;
  
  category.functions.forEach(func => {
	const funcName = func.signature.split('(')[0].split('::').pop();
	
	mdxContent += `### ${funcName}\n`;
	mdxContent += `**Signature**:\n`;
	mdxContent += `\`\`\`rust\n${func.signature}\n\`\`\`\n`;
	mdxContent += `**Gas Cost**: ${func.gas_cost} lex  \n`;
	
	if (func.description) {
	  // Escape description text but preserve it outside of code blocks
	  mdxContent += `**Description**: ${escapeForMDX(func.description)}  \n`;
	}
	
	if (func.example) {
	  mdxContent += `**Example**:  \n`;
	  mdxContent += `\`\`\`rust\n${func.example}\n\`\`\`\n`;
	}
	
	mdxContent += `\n`;
  });
});

// Write the MDX file
fs.writeFileSync(outputPath, mdxContent);
console.log('✅ Successfully generated standard-library.mdx');
