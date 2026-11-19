// Functional test of the Pagefind search: types a word in the search box on each blog index
// in headless Chrome and fails if no results show up.
//
//   npm run test:search                      tests the local build in dist/ (run npm run build first)
//   npm run test:search -- https://szimnau.dk  tests the live site
//
// A page crawl does not catch a broken search. The index files were once redirected to a
// missing URL for three weeks before anyone noticed, so run this after changes to
// redirect-worker.js, _headers, wrangler.toml or the pagefind version.
// Chrome is found via CHROME_PATH or the default Windows, macOS and Linux locations.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const WORD = 'Proxmox';
const LANGS = ['en', 'da', 'de'];
const CDP_PORT = 9346;
const LOCAL_PORT = 4398;

const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && fs.existsSync(p));
if (!chrome) {
  console.error('Chrome not found. Set CHROME_PATH.');
  process.exit(2);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm' };

function serveDist() {
  const root = path.resolve('dist');
  if (!fs.existsSync(path.join(root, 'pagefind'))) {
    console.error('dist/pagefind is missing. Run npm run build first.');
    process.exit(2);
  }
  const server = http.createServer(async (req, res) => {
    let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    try {
      if ((await fsp.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await fsp.readFile(file);
      res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(LOCAL_PORT, () => resolve(server)));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let server;
let base = process.argv[2]?.replace(/\/$/, '');
if (!base) {
  server = await serveDist();
  base = `http://localhost:${LOCAL_PORT}`;
}

const profile = await fsp.mkdtemp(path.join(os.tmpdir(), 'test-search-'));
const proc = spawn(chrome, [
  '--headless=new', '--disable-gpu', `--remote-debugging-port=${CDP_PORT}`,
  `--user-data-dir=${profile}`, '--window-size=1280,900', 'about:blank',
], { stdio: 'ignore' });

let failed = false;
try {
  let target;
  for (let i = 0; i < 40 && !target; i++) {
    try {
      const tabs = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json`)).json();
      target = tabs.find((t) => t.type === 'page')?.webSocketDebuggerUrl;
    } catch {
      await sleep(500);
    }
  }
  if (!target) throw new Error('Chrome did not open a debugging port');

  const ws = new WebSocket(target);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (pending.has(msg.id)) {
      pending.get(msg.id)(msg.result ?? {});
      pending.delete(msg.id);
    }
  };
  const call = (method, params = {}) =>
    new Promise((resolve) => {
      pending.set(++id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => (await call('Runtime.evaluate', { expression })).result?.value;

  await call('Page.enable');
  await call('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 szimnau-check Chrome' });

  for (const lang of LANGS) {
    await call('Page.navigate', { url: `${base}/${lang}/blog/` });
    await sleep(4000);
    const typed = await evaluate(`(() => {
      const input = document.querySelector('#search input, .pagefind-ui__search-input');
      if (!input) return false;
      input.focus();
      input.value = ${JSON.stringify(WORD)};
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`);
    let results = 0;
    for (let i = 0; i < 10 && typed && !results; i++) {
      await sleep(500);
      results = await evaluate("document.querySelectorAll('.pagefind-ui__result').length");
    }
    const ok = typed && results > 0;
    failed ||= !ok;
    console.log(`${ok ? 'ok  ' : 'FAIL'} /${lang}/blog/  ${typed ? `${results} results for "${WORD}"` : 'search box not found'}`);
  }
  ws.close();
} finally {
  proc.kill();
  server?.close();
}
console.log(failed ? `Search test failed against ${base}` : `Search works on all ${LANGS.length} blog indexes (${base})`);
process.exit(failed ? 1 : 0);
