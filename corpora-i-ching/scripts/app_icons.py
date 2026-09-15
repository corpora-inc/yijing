"""Shared app-icon checks: render the committed master, decode PNGs, compare pixels.

The master lives in icon-src/. `tauri icon` renders every platform's icons from it;
these helpers let the checks compare generated projects and shipped artifacts
against a fresh render instead of trusting whatever the Tauri templates left behind.
"""
from pathlib import Path
import struct
import subprocess
import tempfile
import zlib

APP = Path(__file__).resolve().parents[1]
MANIFEST = APP / 'icon-src/icon-manifest.json'


def render(output: Path) -> Path:
    """Render every icon from the master into `output` (an empty directory)."""
    result = subprocess.run(['npx', 'tauri', 'icon', str(MANIFEST), '--output', str(output)],
                            cwd=APP, capture_output=True, text=True)
    if result.returncode:
        raise SystemExit(f'FAIL: tauri icon could not render icon-src/:\n{result.stdout}{result.stderr}')
    return output


def rendered():
    return tempfile.TemporaryDirectory(prefix='yijing-icons-')


def decode_png(data: bytes):
    """Decode an 8-bit PNG (including Xcode's CgBI variant) to (width, height, RGB over white)."""
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError('not a PNG')
    pos, chunks, idat, cgbi = 8, {}, b'', False
    while pos < len(data):
        length, kind = struct.unpack('>I4s', data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if kind == b'CgBI':
            cgbi = True
        elif kind == b'IDAT':
            idat += body
        else:
            chunks[kind] = body
    width, height, depth, color, _, _, interlace = struct.unpack('>IIBBBBB', chunks[b'IHDR'])
    if depth != 8 or interlace:
        raise ValueError(f'unsupported PNG: depth {depth}, interlace {interlace}')
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color]
    raw = zlib.decompress(idat, -15) if cgbi else zlib.decompress(idat)
    stride = width * channels
    rows, previous, offset = [], bytearray(stride), 0
    for _ in range(height):
        kind, line = raw[offset], bytearray(raw[offset + 1:offset + 1 + stride])
        offset += 1 + stride
        for i in range(stride):
            left = line[i - channels] if i >= channels else 0
            up, corner = previous[i], previous[i - channels] if i >= channels else 0
            if kind == 1:
                line[i] = (line[i] + left) & 255
            elif kind == 2:
                line[i] = (line[i] + up) & 255
            elif kind == 3:
                line[i] = (line[i] + (left + up) // 2) & 255
            elif kind == 4:
                p = left + up - corner
                pa, pb, pc = abs(p - left), abs(p - up), abs(p - corner)
                line[i] = (line[i] + (left if pa <= pb and pa <= pc else up if pb <= pc else corner)) & 255
        rows.append(line)
        previous = line
    palette, alphas = chunks.get(b'PLTE', b''), chunks.get(b'tRNS', b'')
    pixels = []
    for line in rows:
        for x in range(width):
            px = line[x * channels:(x + 1) * channels]
            if color == 0:
                r = g = b = px[0]; a = 255
            elif color == 2:
                r, g, b = px; a = 255
            elif color == 3:
                r, g, b = palette[px[0] * 3:px[0] * 3 + 3]
                a = alphas[px[0]] if px[0] < len(alphas) else 255
            elif color == 4:
                r = g = b = px[0]; a = px[1]
            elif cgbi:  # premultiplied BGRA
                b, g, r, a = px
                r, g, b = (min(255, c * 255 // a) if a else 0 for c in (r, g, b))
            else:
                r, g, b, a = px
            pixels.append(tuple((c * a + 255 * (255 - a)) // 255 for c in (r, g, b)))
    return width, height, pixels


def assert_same_pixels(actual: bytes, expected: bytes, label: str):
    """Fail unless two PNGs show the same picture (tolerating re-encoding and rounding)."""
    aw, ah, a = decode_png(actual)
    ew, eh, e = decode_png(expected)
    if (aw, ah) != (ew, eh):
        raise SystemExit(f'FAIL: {label} is {aw}x{ah}, expected {ew}x{eh}')
    off = sum(1 for p, q in zip(a, e) if max(abs(x - y) for x, y in zip(p, q)) > 24)
    if off > len(e) // 200:
        raise SystemExit(f'FAIL: {label} does not match the icon master ({off} of {len(e)} pixels differ)')
    print(f'PASS: {label} matches the icon master')


def assert_artifact_icons(archive, expected: Path):
    """Check the launcher icons inside an opened .ipa, .aab, or .apk zip."""
    names = archive.namelist()
    if any(n.startswith('Payload/') for n in names):
        pairs = {'AppIcon60x60@2x.png': 'ios/AppIcon-60x60@2x.png',
                 'AppIcon76x76@2x~ipad.png': 'ios/AppIcon-76x76@2x.png'}
        found = {n.rsplit('/', 1)[1]: n for n in names if n.count('/') == 2 and n.rsplit('/', 1)[1] in pairs}
    else:
        pairs = {f'{icon}.png': f'android/mipmap-xxxhdpi/{icon}.png'
                 for icon in ('ic_launcher', 'ic_launcher_round', 'ic_launcher_foreground',
                              'ic_launcher_background', 'ic_launcher_monochrome')}
        found = {n.rsplit('/', 1)[1]: n for n in names
                 if '/' in n and n.split('/')[-2].startswith('mipmap-xxxhdpi') and n.rsplit('/', 1)[1] in pairs}
    for name, entry in found.items():
        assert_same_pixels(archive.read(entry), (expected / pairs[name]).read_bytes(), entry)
    missing = sorted(set(pairs) - set(found))
    if missing:
        raise SystemExit(f'FAIL: launcher icons missing from the artifact: {missing}')
