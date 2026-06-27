const fs = require('node:fs')
const path = require('node:path')

const root = path.resolve(__dirname, '..')
const packageJson = require(path.join(root, 'package.json'))
const releaseDir = path.join(root, 'release')
const appPath = path.join(releaseDir, 'Tarski Logic Quest.app')
const contentsDir = path.join(appPath, 'Contents')
const macosDir = path.join(contentsDir, 'MacOS')
const resourcesDir = path.join(contentsDir, 'Resources')
const distSource = path.join(root, 'dist')
const distTarget = path.join(resourcesDir, 'dist')
const iconSource = path.join(root, 'assets', 'app-icon.icns')
const iconTarget = path.join(resourcesDir, 'AppIcon.icns')
const executablePath = path.join(macosDir, 'Tarski Logic Quest')
const serverPath = path.join(resourcesDir, 'server.cjs')

if (!fs.existsSync(distSource)) {
  throw new Error('dist/ does not exist. Run npm run build first.')
}

if (!fs.existsSync(iconSource)) {
  throw new Error('assets/app-icon.icns does not exist. Run npm run icon first.')
}

fs.rmSync(appPath, { force: true, recursive: true })
fs.mkdirSync(macosDir, { recursive: true })
fs.mkdirSync(resourcesDir, { recursive: true })
fs.cpSync(distSource, distTarget, { recursive: true })
fs.copyFileSync(iconSource, iconTarget)

fs.writeFileSync(
  path.join(contentsDir, 'Info.plist'),
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleDisplayName</key>
  <string>Tarski Logic Quest</string>
  <key>CFBundleExecutable</key>
  <string>Tarski Logic Quest</string>
  <key>CFBundleIdentifier</key>
  <string>com.xuzetong.tarskilogicquest.launcher</string>
  <key>CFBundleIconFile</key>
  <string>AppIcon</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>Tarski Logic Quest</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>${packageJson.version}</string>
  <key>CFBundleVersion</key>
  <string>${packageJson.version}</string>
  <key>LSMinimumSystemVersion</key>
  <string>10.13</string>
</dict>
</plist>
`,
)

fs.writeFileSync(
  serverPath,
  `const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const root = process.argv[2]
const port = Number(process.argv[3] || 17673)
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
}

function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const safePath = path.normalize(decoded).replace(/^\\.\\.(\\/|\\\\|$)/, '')
  const filePath = path.join(root, safePath === '/' ? 'index.html' : safePath)
  if (!filePath.startsWith(root)) return path.join(root, 'index.html')
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(root, 'index.html')
}

http.createServer((request, response) => {
  const filePath = resolveFile(request.url || '/')
  response.setHeader('Content-Type', mimeTypes[path.extname(filePath)] || 'application/octet-stream')
  fs.createReadStream(filePath).pipe(response)
}).listen(port, '127.0.0.1')
`,
)

fs.writeFileSync(
  executablePath,
  `#!/bin/zsh
set -e

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$APP_DIR/Resources/dist"
SERVER_FILE="$APP_DIR/Resources/server.cjs"
PORT="17673"
URL="http://127.0.0.1:$PORT/"
LOG_DIR="$HOME/Library/Logs/Tarski Logic Quest"
LOG_FILE="$LOG_DIR/server.log"

mkdir -p "$LOG_DIR"

if [ -x "/usr/local/bin/node" ]; then
  NODE_BIN="/usr/local/bin/node"
elif [ -x "/opt/homebrew/bin/node" ]; then
  NODE_BIN="/opt/homebrew/bin/node"
elif command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  osascript -e 'display dialog "Node.js is required to launch Tarski Logic Quest locally." buttons {"OK"} default button "OK"'
  exit 1
fi

if ! curl -fsS "$URL" >/dev/null 2>&1; then
  nohup "$NODE_BIN" "$SERVER_FILE" "$DIST_DIR" "$PORT" > "$LOG_FILE" 2>&1 &
  for _ in {1..30}; do
    if curl -fsS "$URL" >/dev/null 2>&1; then
      break
    fi
    sleep 0.1
  done
fi

open "$URL"
`,
)

fs.chmodSync(executablePath, 0o755)

console.log(`Created ${appPath}`)
