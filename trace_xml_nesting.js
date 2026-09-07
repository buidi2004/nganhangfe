const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

try { execFileSync('cmd', ['/c', 'taskkill /F /IM wps.exe 2>nul']); } catch (e) {}

const tempDir = path.join(__dirname, 'temp_inspect_xml_tree');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.copyFileSync('C:\\dev\\app\\BAO_CAO_NHOM_6_FINAL_ACADEMIC.docx', 'C:\\dev\\app\\temp_tree.docx');
const psExtract = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('C:\\dev\\app\\temp_tree.docx', '${tempDir.replace(/\\/g, '\\\\')}');`;
execFileSync('powershell', ['-Command', psExtract]);
fs.unlinkSync('C:\\dev\\app\\temp_tree.docx');

let docXml = fs.readFileSync(path.join(tempDir, 'word', 'document.xml'), 'utf8');

// Let's trace stack of tags to find any mismatched or invalid nesting!
const tagRegex = /<\/?w:(?:p|pPr|tbl|tr|tc|r|rPr)\b[^>]*>/g;
let match;
let stack = [];
let errors = [];

while ((match = tagRegex.exec(docXml)) !== null) {
  const fullTag = match[0];
  const isClose = fullTag.startsWith('</');
  const tagName = fullTag.match(/<\/?w:([a-zA-Z0-9]+)/)[1];
  
  if (!isClose) {
    // Self closing?
    if (fullTag.endsWith('/>')) continue;
    
    // Check invalid parent
    const parent = stack.length > 0 ? stack[stack.length - 1] : null;
    if (tagName === 'p' && (parent === 'pPr' || parent === 'p')) {
      errors.push({ error: `Nested <w:p> inside <w:${parent}>`, pos: match.index, snippet: docXml.substring(match.index - 50, match.index + 100) });
    }
    stack.push(tagName);
  } else {
    if (stack.length === 0) {
      errors.push({ error: `Closing </w:${tagName}> with empty stack`, pos: match.index });
    } else {
      const top = stack.pop();
      if (top !== tagName) {
        errors.push({ error: `Tag mismatch: expected </w:${top}>, got </w:${tagName}>`, pos: match.index, snippet: docXml.substring(match.index - 50, match.index + 50) });
      }
    }
  }
}

console.log('Total nesting errors found:', errors.length);
errors.forEach((err, idx) => {
  console.log(`\nError ${idx + 1}: ${err.error} at pos ${err.pos}`);
  if (err.snippet) console.log('  Snippet:', err.snippet.replace(/<[^>]+>/g, ' '));
});

try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
