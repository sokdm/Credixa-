const ascii = (value) => String(value)
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x20-\x7E]/g, '?');

const markdownLines = (markdown) => {
  const lines = [];
  let inCode = false;
  for (const rawLine of String(markdown).split(/\r?\n/)) {
    let line = rawLine.trimEnd();
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (!inCode) {
      line = line.replace(/^\s*#+\s*/, '')
        .replace(/^\s*>\s?/, '')
        .replace(/^\s*[-*]\s+/, '* ')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\|/g, '  |  ');
    }
    line = ascii(line).replace(/[ \t]+/g, ' ').trim();
    if (!line) {
      lines.push('');
      continue;
    }
    const width = inCode ? 98 : 100;
    while (line.length > width) {
      let splitAt = line.lastIndexOf(' ', width);
      if (splitAt < 25) splitAt = width;
      lines.push(line.slice(0, splitAt));
      line = `  ${line.slice(splitAt).trimStart()}`;
    }
    lines.push(line);
  }
  return lines;
};

const escapePdfText = (line) => line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const markdownToPdf = (markdown) => {
  const lines = markdownLines(markdown);
  const perPage = 65;
  const pages = [];
  for (let index = 0; index < lines.length; index += perPage) pages.push(lines.slice(index, index + perPage));
  const objects = [];
  const addObject = (value) => {
    objects.push(value);
    return objects.length;
  };
  const catalogId = addObject('');
  const pagesId = addObject('');
  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageIds = [];

  for (const pageLines of pages) {
    const text = [
      'BT',
      '/F1 8 Tf',
      '45 790 Td',
      '11 TL',
      ...pageLines.map((line) => `(${escapePdfText(line)}) Tj T*`),
      'ET'
    ].join('\n');
    const contentId = addObject(`<< /Length ${Buffer.byteLength(text, 'ascii')} >>\nstream\n${text}\nendstream`);
    const pageId = addObject('');
    pageIds.push(pageId);
    objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'ascii');
};

module.exports = { markdownToPdf };
