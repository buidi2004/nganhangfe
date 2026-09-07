const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

try { execFileSync('cmd', ['/c', 'taskkill /F /IM wps.exe 2>nul']); } catch (e) {}

const tempDir = path.join(__dirname, 'temp_inspect_pages');
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
fs.copyFileSync('C:\\dev\\app\\BAO_CAO_NHOM_6_FINAL_ACADEMIC.docx', 'C:\\dev\\app\\temp_p.docx');
const psExtract = `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('C:\\dev\\app\\temp_p.docx', '${tempDir.replace(/\\/g, '\\\\')}');`;
execFileSync('powershell', ['-Command', psExtract]);
fs.unlinkSync('C:\\dev\\app\\temp_p.docx');

const appXmlPath = path.join(tempDir, 'docProps', 'app.xml');
if (fs.existsSync(appXmlPath)) {
  const appXml = fs.readFileSync(appXmlPath, 'utf8');
  console.log('--- app.xml content ---');
  console.log(appXml);
}

const docXml = fs.readFileSync(path.join(tempDir, 'word', 'document.xml'), 'utf8');
const pageBreaks = (docXml.match(/<w:br[^>]*w:type="page"[^>]*>/g) || []).length;
const renderedBreaks = (docXml.match(/<w:lastRenderedPageBreak[^>]*\/>/g) || []).length;
const sectionBreaks = (docXml.match(/<w:sectPr\b/g) || []).length;
console.log('\n--- BREAK MARKERS IN DOCUMENT.XML ---');
console.log('Hard page breaks (<w:br w:type="page"/>):', pageBreaks);
console.log('Rendered page breaks (<w:lastRenderedPageBreak/>):', renderedBreaks);
console.log('Section breaks (<w:sectPr>):', sectionBreaks);

const textOnly = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
console.log('Total characters (with spaces):', textOnly.length);
console.log('Total words (approx):', textOnly.split(' ').length);

// Check TOC last page number
const idxTOC = docXml.indexOf('MỤC LỤC TỔNG QUAN BÁO CÁO ĐỒ ÁN');
const idxDMHA = docXml.indexOf('DANH MỤC HÌNH ẢNH VÀ SƠ ĐỒ KIẾN TRÚC');
const tocSlice = docXml.substring(idxTOC, idxDMHA);
const pageRefs = tocSlice.match(/Trang \d+/g) || [];
console.log('Last 5 page references in TOC:', pageRefs.slice(-5));

try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) {}
