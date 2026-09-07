const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

console.log('=== REPACKING DOCX ===');

const unpackedDir = 'C:\\dev\\app\\docx_unpacked';
const targetDocx = 'C:\\dev\\app\\BAO_CAO_NHOM_6_FINAL_ACADEMIC.docx';
const backupDocx = 'C:\\dev\\app\\BAO_CAO_NHOM_6_FINAL_ACADEMIC.docx.bak';

try {
  execFileSync('cmd', ['/c', 'taskkill /F /IM wps.exe 2>nul & taskkill /F /IM winword.exe 2>nul']);
} catch (e) {}

// Backup existing docx if not already backed up
if (fs.existsSync(targetDocx) && !fs.existsSync(backupDocx)) {
  fs.copyFileSync(targetDocx, backupDocx);
  console.log('Created backup:', backupDocx);
}

// Remove old docx
if (fs.existsSync(targetDocx)) {
  fs.unlinkSync(targetDocx);
}

const psPack = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${unpackedDir.replace(/\\/g, '\\\\')}', '${targetDocx.replace(/\\/g, '\\\\')}');`;
execFileSync('powershell', ['-Command', psPack]);

console.log('Repacked successfully!');
console.log('New DOCX size:', fs.statSync(targetDocx).size, 'bytes');
