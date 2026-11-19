import zlib
import struct
import base64

def create_monochrome_chart_png(width=640, height=360) -> str:
    """
    Generates a crisp monochrome 640x360 analytical bar chart as a valid PNG image.
    Pure black (#000000), dark neutral gray (#333333, #666666), light gray gridlines (#E5E5E5), crisp white (#FFFFFF).
    Zero external dependencies required.
    """
    # Create image buffer: RGB (3 bytes per pixel)
    # Background: white (255, 255, 255)
    pixels = [[(255, 255, 255) for _ in range(width)] for _ in range(height)]

    # Draw chart bounding box / axes
    margin_left = 60
    margin_right = 40
    margin_top = 40
    margin_bottom = 60
    chart_w = width - margin_left - margin_right
    chart_h = height - margin_top - margin_bottom

    # Gridlines (horizontal dashed every 40px)
    for y in range(margin_top, margin_top + chart_h + 1, 50):
        for x in range(margin_left, margin_left + chart_w):
            if (x // 6) % 2 == 0:
                pixels[y][x] = (229, 229, 229)

    # Left Y-axis & Bottom X-axis
    for y in range(margin_top, margin_top + chart_h + 1):
        pixels[y][margin_left] = (0, 0, 0)
        pixels[y][margin_left - 1] = (0, 0, 0)
    for x in range(margin_left, margin_left + chart_w + 1):
        pixels[margin_top + chart_h][x] = (0, 0, 0)
        pixels[margin_top + chart_h + 1][x] = (0, 0, 0)

    # Bars data: [68, 120, 195, 145, 230, 210]
    bar_values = [68, 120, 195, 145, 230, 210]
    max_val = 260
    bar_count = len(bar_values)
    slot_w = chart_w // bar_count
    bar_w = int(slot_w * 0.55)

    for i, val in enumerate(bar_values):
        bar_h = int((val / max_val) * (chart_h - 20))
        bx1 = margin_left + i * slot_w + (slot_w - bar_w) // 2
        bx2 = bx1 + bar_w
        by1 = margin_top + chart_h - bar_h
        by2 = margin_top + chart_h

        # Alternating monochrome fills: pure black and dark gray
        fill_color = (0, 0, 0) if i % 2 == 0 else (60, 60, 60)
        for y in range(by1, by2):
            for x in range(bx1, bx2):
                # Border in black, inner in fill_color
                if x in (bx1, bx2 - 1) or y in (by1, by2 - 1):
                    pixels[y][x] = (0, 0, 0)
                else:
                    pixels[y][x] = fill_color

    # Build raw PNG byte stream
    def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)

    header = b"\x89PNG\r\n\x1a\n"
    ihdr = png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))

    raw_data = bytearray()
    for row in pixels:
        raw_data.append(0)  # filter type None
        for r, g, b in row:
            raw_data.extend((r, g, b))

    idat = png_chunk(b"IDAT", zlib.compress(bytes(raw_data), level=9))
    iend = png_chunk(b"IEND", b"")

    png_bytes = header + ihdr + idat + iend
    return f"data:image/png;base64,{base64.b64encode(png_bytes).decode('utf-8')}"
