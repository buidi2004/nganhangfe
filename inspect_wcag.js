const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

try { execFileSync('cmd', ['/c', 'taskkill /F /IM wps.exe 2>nul']); } catch (e) {}

const tempDir = path.join(__dirname, 'temp_inspect_wcag');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.copyFileSync('C:\\dev\\app\\BAO_CAO_NHOM_6_FINAL_ACADEMIC.docx', 'C:\\dev\\app\\temp_w.docx');
const psExtract = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('C:\\dev\\app\\temp_w.docx', '${tempDir.replace(/\\/g, '\\\\')}');`;
execFileSync('powershell', ['-Command', psExtract]);
fs.unlinkSync('C:\\dev\\app\\temp_w.docx');

let docXml = fs.readFileSync(path.join(tempDir, 'word', 'document.xml'), 'utf8');

const idxWCAG = docXml.indexOf('WCAG 2.1 AAA');
console.log('idxWCAG:', idxWCAG);
if (idxWCAG !== -1) {
  console.log('Around WCAG:');
  console.log(docXml.substring(idxWCAG, idxWCAG + 1500));
}

try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
