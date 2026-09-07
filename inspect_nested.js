const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

try { execFileSync('cmd', ['/c', 'taskkill /F /IM wps.exe 2>nul']); } catch (e) {}

const tempDir = path.join(__dirname, 'temp_inspect_nested');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.copyFileSync('C:\\dev\\app\\BAO_CAO_NHOM_6_FINAL_ACADEMIC.docx', 'C:\\dev\\app\\temp_n.docx');
const psExtract = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('C:\\dev\\app\\temp_n.docx', '${tempDir.replace(/\\/g, '\\\\')}');`;
execFileSync('powershell', ['-Command', psExtract]);
fs.unlinkSync('C:\\dev\\app\\temp_n.docx');

let docXml = fs.readFileSync(path.join(tempDir, 'word', 'document.xml'), 'utf8');

console.log('Match 1 full paragraph:');
console.log(docXml.substring(283648, 283648 + 600));



// Find all occurrences of literal '<w:p><w:pPr><w:p>' or '<w:p><w:p>'
let countLiteral = 0;
let pos = 0;
while ((pos = docXml.indexOf('<w:p><w:pPr><w:p', pos)) !== -1) {
  if (docXml.startsWith('<w:p><w:pPr><w:p>', pos) || docXml.startsWith('<w:p><w:pPr><w:p ', pos)) {
    console.log('LITERAL NESTED P AT:', pos);
    console.log(docXml.substring(pos, pos + 100));
    countLiteral++;
  }
  pos += 10;
}
console.log('Total literal nested p:', countLiteral);


try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
