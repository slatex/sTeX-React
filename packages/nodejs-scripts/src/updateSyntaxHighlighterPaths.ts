import fs from 'fs';
import path from 'path';

export function updateSyntaxHighlighterPaths() {
  const filePath = path.join(
    __dirname,
    '../../../../../../node_modules/myst-to-react/dist/code.js'
  );

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const updatedContent = fileContent
      .replace(
        /import light from 'react-syntax-highlighter\/dist\/esm\/styles\/hljs\/xcode.js';/g,
        "import light from 'react-syntax-highlighter/dist/cjs/styles/hljs/xcode.js';"
      )
      .replace(
        /import dark from 'react-syntax-highlighter\/dist\/esm\/styles\/hljs\/vs2015.js';/g,
        "import dark from 'react-syntax-highlighter/dist/cjs/styles/hljs/vs2015.js';"
      );

    fs.writeFileSync(filePath, updatedContent);
    console.log('File updated successfully.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}
