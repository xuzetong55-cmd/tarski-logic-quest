const fs = require('node:fs')
const path = require('node:path')
const zlib = require('node:zlib')

const root = path.resolve(__dirname, '..')
const iconsetDir = path.join(root, 'build', 'app-icon.iconset')
const assetsDir = path.join(root, 'assets')
const previewPath = path.join(assetsDir, 'app-icon-1024.png')

const iconEntries = [
  ['icon_16x16.png', 16],
  ['icon_16x16@2x.png', 32],
  ['icon_32x32.png', 32],
  ['icon_32x32@2x.png', 64],
  ['icon_128x128.png', 128],
  ['icon_128x128@2x.png', 256],
  ['icon_256x256.png', 256],
  ['icon_256x256@2x.png', 512],
  ['icon_512x512.png', 512],
  ['icon_512x512@2x.png', 1024],
]

function crc32(buffer) {
  let crc = -1
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i]
    for (let j = 0; j < 8; j += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return (crc ^ -1) >>> 0
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type)
  const length = Buffer.alloc(4)
  const checksum = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([length, typeBuffer, data, checksum])
}

function writePng(filePath, width, height, pixels) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1)
    raw[rowStart] = 0
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 6

  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
  fs.writeFileSync(filePath, png)
}

function hexColor(hex, alpha = 255) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
    alpha,
  ]
}

function blendPixel(pixels, size, x, y, color, alphaScale = 1) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const index = (Math.floor(y) * size + Math.floor(x)) * 4
  const sourceAlpha = (color[3] / 255) * alphaScale
  const targetAlpha = pixels[index + 3] / 255
  const outAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha)
  if (outAlpha <= 0) return

  pixels[index] = Math.round((color[0] * sourceAlpha + pixels[index] * targetAlpha * (1 - sourceAlpha)) / outAlpha)
  pixels[index + 1] = Math.round((color[1] * sourceAlpha + pixels[index + 1] * targetAlpha * (1 - sourceAlpha)) / outAlpha)
  pixels[index + 2] = Math.round((color[2] * sourceAlpha + pixels[index + 2] * targetAlpha * (1 - sourceAlpha)) / outAlpha)
  pixels[index + 3] = Math.round(outAlpha * 255)
}

function smoothAlpha(distance) {
  return Math.max(0, Math.min(1, 0.5 - distance))
}

function roundedDistance(px, py, x, y, width, height, radius) {
  const qx = Math.abs(px - (x + width / 2)) - (width / 2 - radius)
  const qy = Math.abs(py - (y + height / 2)) - (height / 2 - radius)
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius
}

function drawRoundedRect(pixels, size, x, y, width, height, radius, color) {
  const minX = Math.max(0, Math.floor(x - 2))
  const maxX = Math.min(size - 1, Math.ceil(x + width + 2))
  const minY = Math.max(0, Math.floor(y - 2))
  const maxY = Math.min(size - 1, Math.ceil(y + height + 2))
  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const distance = roundedDistance(px + 0.5, py + 0.5, x, y, width, height, radius)
      const alpha = smoothAlpha(distance)
      if (alpha > 0) blendPixel(pixels, size, px, py, color, alpha)
    }
  }
}

function drawCircle(pixels, size, cx, cy, radius, color) {
  const minX = Math.max(0, Math.floor(cx - radius - 2))
  const maxX = Math.min(size - 1, Math.ceil(cx + radius + 2))
  const minY = Math.max(0, Math.floor(cy - radius - 2))
  const maxY = Math.min(size - 1, Math.ceil(cy + radius + 2))
  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const alpha = smoothAlpha(Math.hypot(px + 0.5 - cx, py + 0.5 - cy) - radius)
      if (alpha > 0) blendPixel(pixels, size, px, py, color, alpha)
    }
  }
}

function pointLineDistance(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  const x = ax + t * dx
  const y = ay + t * dy
  return Math.hypot(px - x, py - y)
}

function drawLine(pixels, size, ax, ay, bx, by, thickness, color) {
  const minX = Math.max(0, Math.floor(Math.min(ax, bx) - thickness - 2))
  const maxX = Math.min(size - 1, Math.ceil(Math.max(ax, bx) + thickness + 2))
  const minY = Math.max(0, Math.floor(Math.min(ay, by) - thickness - 2))
  const maxY = Math.min(size - 1, Math.ceil(Math.max(ay, by) + thickness + 2))
  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const alpha = smoothAlpha(pointLineDistance(px + 0.5, py + 0.5, ax, ay, bx, by) - thickness / 2)
      if (alpha > 0) blendPixel(pixels, size, px, py, color, alpha)
    }
  }
}

function drawTriangle(pixels, size, points, color) {
  const minX = Math.max(0, Math.floor(Math.min(...points.map((point) => point[0])) - 2))
  const maxX = Math.min(size - 1, Math.ceil(Math.max(...points.map((point) => point[0])) + 2))
  const minY = Math.max(0, Math.floor(Math.min(...points.map((point) => point[1])) - 2))
  const maxY = Math.min(size - 1, Math.ceil(Math.max(...points.map((point) => point[1])) + 2))
  const [a, b, c] = points
  const area = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
  for (let py = minY; py <= maxY; py += 1) {
    for (let px = minX; px <= maxX; px += 1) {
      const x = px + 0.5
      const y = py + 0.5
      const u = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / area
      const v = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / area
      const w = 1 - u - v
      if (u >= 0 && v >= 0 && w >= 0) blendPixel(pixels, size, px, py, color)
    }
  }
}

function renderIcon(size) {
  const pixels = Buffer.alloc(size * size * 4)
  const scale = size / 1024
  const c = (value) => value * scale
  const deepTeal = hexColor('#133c38')
  const tealLight = hexColor('#1f6a61', 205)
  const board = hexColor('#f6f0df')
  const boardLine = hexColor('#a9b9a6', 180)
  const ink = hexColor('#142522')
  const gold = hexColor('#f2bd4c')
  const coral = hexColor('#df6d58')
  const sky = hexColor('#6aa6d8')
  const leaf = hexColor('#66a972')
  const shadow = hexColor('#071414', 80)

  drawRoundedRect(pixels, size, c(52), c(52), c(920), c(920), c(210), deepTeal)
  drawCircle(pixels, size, c(780), c(210), c(250), tealLight)
  drawRoundedRect(pixels, size, c(154), c(236), c(628), c(612), c(70), shadow)
  drawRoundedRect(pixels, size, c(140), c(214), c(628), c(612), c(70), board)

  for (const offset of [1, 2, 3]) {
    const x = c(140 + (628 / 4) * offset)
    const y = c(214 + (612 / 4) * offset)
    drawLine(pixels, size, x, c(236), x, c(804), Math.max(1, c(10)), boardLine)
    drawLine(pixels, size, c(162), y, c(746), y, Math.max(1, c(10)), boardLine)
  }

  drawRoundedRect(pixels, size, c(220), c(334), c(136), c(136), c(28), sky)
  drawLine(pixels, size, c(238), c(354), c(332), c(354), c(15), ink)
  drawLine(pixels, size, c(332), c(354), c(332), c(448), c(15), ink)
  drawLine(pixels, size, c(332), c(448), c(238), c(448), c(15), ink)
  drawLine(pixels, size, c(238), c(448), c(238), c(354), c(15), ink)

  drawTriangle(pixels, size, [[c(568), c(338)], [c(660), c(500)], [c(478), c(500)]], coral)
  drawLine(pixels, size, c(568), c(338), c(660), c(500), c(14), ink)
  drawLine(pixels, size, c(660), c(500), c(478), c(500), c(14), ink)
  drawLine(pixels, size, c(478), c(500), c(568), c(338), c(14), ink)

  drawCircle(pixels, size, c(348), c(664), c(72), leaf)
  drawLine(pixels, size, c(276), c(664), c(420), c(664), c(14), ink)
  drawLine(pixels, size, c(348), c(592), c(348), c(736), c(14), ink)

  drawLine(pixels, size, c(262), c(584), c(432), c(486), c(28), gold)
  drawLine(pixels, size, c(432), c(486), c(610), c(586), c(28), gold)
  drawCircle(pixels, size, c(262), c(584), c(27), gold)
  drawCircle(pixels, size, c(432), c(486), c(27), gold)
  drawCircle(pixels, size, c(610), c(586), c(27), gold)

  drawLine(pixels, size, c(705), c(208), c(850), c(506), c(56), gold)
  drawLine(pixels, size, c(963), c(208), c(818), c(506), c(56), gold)
  drawLine(pixels, size, c(758), c(362), c(910), c(362), c(48), gold)
  drawLine(pixels, size, c(734), c(184), c(936), c(184), c(48), gold)

  drawLine(pixels, size, c(752), c(692), c(884), c(824), c(34), gold)
  drawLine(pixels, size, c(884), c(824), c(934), c(724), c(34), gold)
  drawLine(pixels, size, c(884), c(824), c(774), c(854), c(34), gold)

  return pixels
}

fs.rmSync(iconsetDir, { force: true, recursive: true })
fs.mkdirSync(iconsetDir, { recursive: true })
fs.mkdirSync(assetsDir, { recursive: true })

for (const [filename, size] of iconEntries) {
  writePng(path.join(iconsetDir, filename), size, size, renderIcon(size))
}

writePng(previewPath, 1024, 1024, renderIcon(1024))

console.log(`Created ${iconsetDir}`)
console.log(`Created ${previewPath}`)
