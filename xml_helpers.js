const fs = require('fs');
const path = require('path');

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function makeParagraph(text, opts = {}) {
  const align = opts.align || 'both';
  const spaceBefore = opts.spaceBefore !== undefined ? opts.spaceBefore : 60;
  const spaceAfter = opts.spaceAfter !== undefined ? opts.spaceAfter : 120;
  const lineRule = opts.lineRule || 'auto';
  const line = opts.line || 360; // 1.5 line spacing (360/240)
  const bold = opts.bold ? '<w:b/><w:bCs/>' : '<w:b w:val="false"/><w:bCs w:val="false"/>';
  const italic = opts.italic ? '<w:i/><w:iCs/>' : '';
  const color = opts.color || '0F172A';
  const sz = opts.sz || 26; // 13pt
  const font = opts.font || 'Times New Roman';

  return `<w:p><w:pPr><w:spacing w:line="${line}" w:lineRule="${lineRule}" w:before="${spaceBefore}" w:after="${spaceAfter}"/><w:jc w:val="${align}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="${font}" w:cs="${font}" w:eastAsia="${font}" w:hAnsi="${font}"/>${bold}${italic}<w:color w:val="${color}"/><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function makeHeading2(text) {
  return `<w:p><w:pPr><w:pStyle w:val="Heading2"/><w:spacing w:before="280" w:after="140"/><w:jc w:val="left"/><w:outlineLvl w:val="1"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:bCs/><w:color w:val="0F2C59"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function makeHeading3(text) {
  return `<w:p><w:pPr><w:pStyle w:val="Heading3"/><w:spacing w:before="220" w:after="100"/><w:jc w:val="left"/><w:outlineLvl w:val="2"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:bCs/><w:color w:val="700F43"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function makeCallout(title, text) {
  return `<w:tbl><w:tblPr><w:tblW w:type="pct" w:w="100%"/><w:tblBorders><w:top w:val="none" w:color="FFFFFF" w:sz="0"/><w:left w:val="single" w:color="0F2C59" w:sz="24"/><w:bottom w:val="none" w:color="FFFFFF" w:sz="0"/><w:right w:val="none" w:color="FFFFFF" w:sz="0"/><w:insideH w:val="none" w:color="FFFFFF" w:sz="0"/><w:insideV w:val="none" w:color="FFFFFF" w:sz="0"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="100"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr><w:tc><w:tcPr><w:tcW w:type="pct" w:w="100%"/><w:shd w:fill="F1F5F9" w:val="clear"/><w:tcMar><w:top w:type="dxa" w:w="140"/><w:left w:type="dxa" w:w="180"/><w:bottom w:type="dxa" w:w="140"/><w:right w:type="dxa" w:w="180"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:before="40" w:after="40"/><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:bCs/><w:color w:val="0F2C59"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">${escapeXml(title)}</w:t></w:r></w:p><w:p><w:pPr><w:spacing w:before="40" w:after="40" w:line="320" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:i/><w:color w:val="1E293B"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p></w:tc></w:tr></w:tbl>`;
}

function makeTable(headers, rows, colWidthsPct = []) {
  const colsCount = headers.length;
  let gridXml = '';
  for (let i = 0; i < colsCount; i++) {
    gridXml += `<w:gridCol w:w="100"/>`;
  }

  let headRowXml = `<w:tr><w:trPr><w:tblHeader/><w:cantSplit/></w:trPr>`;
  headers.forEach((h, i) => {
    const w = colWidthsPct[i] || `${Math.floor(100 / colsCount)}%`;
    headRowXml += `<w:tc><w:tcPr><w:tcW w:type="pct" w:w="${w}"/><w:shd w:fill="0F2C59" w:val="clear"/><w:tcMar><w:top w:type="dxa" w:w="100"/><w:left w:type="dxa" w:w="120"/><w:bottom w:type="dxa" w:w="100"/><w:right w:type="dxa" w:w="120"/></w:tcMar></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:bCs/><w:color w:val="FFFFFF"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(h)}</w:t></w:r></w:p></w:tc>`;
  });
  headRowXml += `</w:tr>`;

  let dataRowsXml = '';
  rows.forEach((row, rIdx) => {
    const fill = rIdx % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
    dataRowsXml += `<w:tr><w:trPr><w:cantSplit/></w:trPr>`;
    row.forEach((cell, cIdx) => {
      const w = colWidthsPct[cIdx] || `${Math.floor(100 / colsCount)}%`;
      const align = cIdx === 0 && row.length > 2 ? 'center' : (cIdx === 1 ? 'left' : (row.length === 2 && cIdx === 1 ? 'center' : 'left'));
      const bold = cIdx === 0 && row.length > 2;
      const lines = String(cell).split('\n');
      let cellTextXml = '';
      lines.forEach((line, lIdx) => {
        const spaceAfter = lIdx === lines.length - 1 ? 40 : 20;
        cellTextXml += `<w:p><w:pPr><w:spacing w:before="20" w:after="${spaceAfter}" w:line="280" w:lineRule="auto"/><w:jc w:val="${align}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/>${bold ? '<w:b/><w:bCs/>' : ''}<w:color w:val="0F172A"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`;
      });

      dataRowsXml += `<w:tc><w:tcPr><w:tcW w:type="pct" w:w="${w}"/><w:shd w:fill="${fill}" w:val="clear"/><w:tcMar><w:top w:type="dxa" w:w="80"/><w:left w:type="dxa" w:w="120"/><w:bottom w:type="dxa" w:w="80"/><w:right w:type="dxa" w:w="120"/></w:tcMar></w:tcPr>${cellTextXml}</w:tc>`;
    });
    dataRowsXml += `</w:tr>`;
  });

  return `<w:tbl><w:tblPr><w:tblW w:type="pct" w:w="100%"/><w:tblBorders><w:top w:val="single" w:color="0F2C59" w:sz="6"/><w:left w:val="single" w:color="CBD5E1" w:sz="4"/><w:bottom w:val="single" w:color="0F2C59" w:sz="6"/><w:right w:val="single" w:color="CBD5E1" w:sz="4"/><w:insideH w:val="single" w:color="E2E8F0" w:sz="4"/><w:insideV w:val="single" w:color="CBD5E1" w:sz="4"/></w:tblBorders></w:tblPr><w:tblGrid>${gridXml}</w:tblGrid>${headRowXml}${dataRowsXml}</w:tbl>`;
}

function makeDrawingXml(rId, docPrId) {
  return `<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="1666875" cy="3571875"/><wp:effectExtent t="0" r="0" b="0" l="0"/><wp:docPr id="${docPrId}" name="" descr="" title=""/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="" descr=""/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}" cstate="none"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="1666875" cy="3571875"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing>`;
}

function makeImageCellXml(meta, docPrId) {
  const drawing = makeDrawingXml(meta.rId, docPrId);
  return `<w:tc><w:tcPr><w:tcW w:type="pct" w:w="50%"/><w:tcMar><w:top w:type="dxa" w:w="80"/><w:left w:type="dxa" w:w="100"/><w:bottom w:type="dxa" w:w="80"/><w:right w:type="dxa" w:w="100"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:after="80" w:before="120"/><w:jc w:val="center"/></w:pPr><w:r>${drawing}</w:r></w:p><w:p><w:pPr><w:spacing w:after="60" w:before="60"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:bCs/><w:color w:val="0F2C59"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr><w:t xml:space="preserve">Hình ${meta.figNum}: ${escapeXml(meta.title)}</w:t></w:r></w:p><w:p><w:pPr><w:spacing w:after="100" w:before="40" w:line="280" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="1E293B"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr><w:t xml:space="preserve">${escapeXml(meta.desc)}</w:t></w:r></w:p></w:tc>`;
}

function makeImagePairTable(meta1, meta2, docPrBase) {
  let cell2Xml = '';
  if (meta2) {
    cell2Xml = makeImageCellXml(meta2, docPrBase + 1);
  } else {
    cell2Xml = `<w:tc><w:tcPr><w:tcW w:type="pct" w:w="50%"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p></w:tc>`;
  }

  const cell1Xml = makeImageCellXml(meta1, docPrBase);

  return `<w:tbl><w:tblPr><w:tblW w:type="pct" w:w="100%"/><w:tblBorders><w:top w:val="none" w:color="FFFFFF" w:sz="0"/><w:left w:val="none" w:color="FFFFFF" w:sz="0"/><w:bottom w:val="none" w:color="FFFFFF" w:sz="0"/><w:right w:val="none" w:color="FFFFFF" w:sz="0"/><w:insideH w:val="none" w:color="FFFFFF" w:sz="0"/><w:insideV w:val="none" w:color="FFFFFF" w:sz="0"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="100"/><w:gridCol w:w="100"/></w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>${cell1Xml}${cell2Xml}</w:tr></w:tbl>`;
}

module.exports = {
  escapeXml,
  makeParagraph,
  makeHeading2,
  makeHeading3,
  makeCallout,
  makeTable,
  makeDrawingXml,
  makeImageCellXml,
  makeImagePairTable
};
