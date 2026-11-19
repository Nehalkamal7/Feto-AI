import zlib from "zlib";

/**
 * Generates a crisp monochrome 640x360 analytical bar chart as a valid base64 PNG data URL.
 * Pure black (#000000), dark neutral gray (#333333, #666666), light gray gridlines (#E5E5E5), crisp white (#FFFFFF).
 * Zero external dependencies.
 */
export function generateMonochromeChartBase64(
  labels: string[] = ["Compute", "Storage", "Vector DB", "Inference", "Ingress", "Egress"],
  values: number[] = [420.5, 185.0, 310.2, 580.4, 125.8, 94.2],
  title: string = "Monthly Infrastructure Spend ($)"
): string {
  const width = 640;
  const height = 360;

  // Pixel buffer: 3 bytes per pixel (RGB)
  const pixels: Uint8Array[] = [];
  for (let y = 0; y < height; y++) {
    const row = new Uint8Array(width * 3);
    row.fill(255); // White background
    pixels.push(row);
  }

  const setPixel = (x: number, y: number, r: number, g: number, b: number) => {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = x * 3;
      pixels[y][idx] = r;
      pixels[y][idx + 1] = g;
      pixels[y][idx + 2] = b;
    }
  };

  const marginL = 60;
  const marginR = 40;
  const marginT = 40;
  const marginB = 60;
  const chartW = width - marginL - marginR;
  const chartH = height - marginT - marginB;

  // Gridlines (horizontal dashed every 45px)
  for (let y = marginT; y <= marginT + chartH; y += 45) {
    for (let x = marginL; x <= marginL + chartW; x++) {
      if (Math.floor(x / 5) % 2 === 0) {
        setPixel(x, y, 229, 229, 229);
      }
    }
  }

  // Left Y-axis & Bottom X-axis
  for (let y = marginT; y <= marginT + chartH; y++) {
    setPixel(marginL, y, 0, 0, 0);
    setPixel(marginL - 1, y, 0, 0, 0);
  }
  for (let x = marginL; x <= marginL + chartW; x++) {
    setPixel(x, marginT + chartH, 0, 0, 0);
    setPixel(x, marginT + chartH + 1, 0, 0, 0);
  }

  // Draw Bars
  const maxVal = Math.max(...values, 100) * 1.15;
  const barCount = values.length;
  const slotW = Math.floor(chartW / barCount);
  const barW = Math.max(12, Math.floor(slotW * 0.55));

  values.forEach((val, i) => {
    const barH = Math.floor((val / maxVal) * (chartH - 20));
    const bx1 = marginL + i * slotW + Math.floor((slotW - barW) / 2);
    const bx2 = bx1 + barW;
    const by1 = marginT + chartH - barH;
    const by2 = marginT + chartH;

    // Alternating monochrome fills: pure black (#000000) and dark gray (#404040)
    const [fr, fg, fb] = i % 2 === 0 ? [0, 0, 0] : [64, 64, 64];

    for (let y = by1; y < by2; y++) {
      for (let x = bx1; x < bx2; x++) {
        if (x === bx1 || x === bx2 - 1 || y === by1 || y === by2 - 1) {
          setPixel(x, y, 0, 0, 0); // border
        } else {
          setPixel(x, y, fr, fg, fb);
        }
      }
    }
  });

  // Build PNG chunks
  const crcTable: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  const crc32 = (buf: Buffer) => {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const makeChunk = (type: string, data: Buffer) => {
    const typeBuf = Buffer.from(type, "ascii");
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  };

  // Header & IHDR
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // RGB color
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk("IHDR", ihdrData);

  // Raw scanlines with filter byte 0
  const rawBytes: number[] = [];
  for (let y = 0; y < height; y++) {
    rawBytes.push(0); // filter type none
    const row = pixels[y];
    for (let i = 0; i < row.length; i++) {
      rawBytes.push(row[i]);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawBytes), { level: 9 });
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  const pngBuffer = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}
