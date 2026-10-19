#!/usr/bin/env node
import {spawn, spawnSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import {createServer} from 'node:net';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : undefined;
};

const MIN_NODE_MAJOR = 22;
const MIN_NODE_MINOR = 13;
const DEFAULT_PORT = 3017;
const isWindows = process.platform === 'win32';

const C = {
  reset: '\u001b[0m', dim: '\u001b[2m', bold: '\u001b[1m',
  green: '\u001b[32m', yellow: '\u001b[33m', red: '\u001b[31m', cyan: '\u001b[36m',
};
const say = (msg = '') => console.log(msg);
const step = (n, total, msg) => say(`${C.cyan}[${n}/${total}]${C.reset} ${C.bold}${msg}${C.reset}`);
const ok = (msg) => say(`      ${C.green}✓${C.reset} ${msg}`);
const skip = (msg) => say(`      ${C.dim}· ${msg}（已跳过）${C.reset}`);
const warn = (msg) => say(`      ${C.yellow}!${C.reset} ${msg}`);
const fail = (msg, hint) => {
  say(`      ${C.red}✗ ${msg}${C.reset}`);
  if (hint) say(`      ${C.dim}${hint}${C.reset}`);
};


const TOTAL_STEPS = 4;

function checkNode() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  const tooOld = major < MIN_NODE_MAJOR || (major === MIN_NODE_MAJOR && minor < MIN_NODE_MINOR);
  if (tooOld) {
    fail(
      `Node 版本过低：当前 v${process.versions.node}，需要 v${MIN_NODE_MAJOR}.${MIN_NODE_MINOR}.0 或更高`,
      '请到 https://nodejs.org 安装 LTS 版本后重新运行本脚本。'
    );
    return false;
  }
  ok(`Node v${process.versions.node}`);
  return true;
}


function isPortFree(port) {
  return new Promise((res) => {
    const probe = createServer();
    probe.once('error', (error) => res(error.code !== 'EADDRINUSE'));
    probe.once('listening', () => probe.close(() => res(true)));
    probe.listen(port, '0.0.0.0');
  });
}

async function resolvePort() {
  const fromArg = valueOf('--port');
  const fromEnv = process.env.PORT;
  const port = Number(fromArg ?? fromEnv ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    fail(`端口无效：${fromArg ?? fromEnv}`, '请用 --port 指定 1–65535 之间的端口。');
    return null;
  }
  if (!(await isPortFree(port))) {
    fail(
      `端口 ${port} 已被占用`,
      `可能是上次的知体还没关。结束它，或换个端口：node scripts/launch.mjs --port ${port + 1}`
    );
    return null;
  }
  ok(`端口 ${port} 可用`);
  return port;
}

function reportAssistantMode() {
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) {
    warn('未找到 .env，AI 助手将以「演示模式」运行（三维探索、课程、全部题库不受影响）');
    say(`      ${C.dim}如需实时 AI，复制 .env.example 为 .env 并填入密钥。${C.reset}`);
    return;
  }
  let mode = '';
  let hasKey = false;
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    if (match[1] === 'AI_MODE') mode = match[2].trim();
    if (match[1] === 'AI_API_KEY' && match[2].trim()) hasKey = true;
  }
  const effective = ['live', 'demo', 'off'].includes(mode) ? mode : hasKey ? 'live' : 'demo';
  if (effective === 'live') ok('AI 助手：实时模式（已读取 .env 中的密钥）');
  else if (effective === 'off') ok('AI 助手：已关闭（AI_MODE=off）');
  else ok('AI 助手：演示模式 · 非实时 AI');
}


function npmCommand() {
  return isWindows ? 'npm.cmd' : 'npm';
}

function resolveNpmCli() {
  // Windows 上不要直接 spawn .cmd，Node 会抛 EINVAL，改用 npm-cli.js。
  const candidates = [
    join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    join(dirname(process.execPath), '..', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return resolve(candidate);
  }
  return null;
}

function runNpm(scriptArgs, label) {
  say(`      ${C.dim}$ npm ${scriptArgs.join(' ')}${C.reset}`);
  const npmCli = resolveNpmCli();
  const command = npmCli ? process.execPath : npmCommand();
  const args = npmCli ? [npmCli, ...scriptArgs] : scriptArgs;
  const result = spawnSync(command, args, {cwd: root, stdio: 'inherit', shell: false});
  if (result.error) {
    fail(
      `${label}无法执行：${result.error.message}`,
      npmCli
        ? '请确认 Node.js 安装完整（包含内置 npm）。'
        : '无法定位 npm。请重新安装 Node.js（https://nodejs.org）。'
    );
    return false;
  }
  if (result.status !== 0) {
    fail(`${label}失败（退出码 ${result.status ?? 'null'}）`);
    return false;
  }
  return true;
}

function ensureDependencies(force) {
  const installed = existsSync(join(root, 'node_modules'));
  if (installed && !force) {
    skip('依赖已存在');
    return true;
  }
  warn(installed ? '按要求重新安装依赖' : '首次运行，正在安装依赖（可能需要几分钟）');
  const hasLock = existsSync(join(root, 'package-lock.json'));
  return runNpm(hasLock ? ['ci'] : ['install'], '依赖安装');
}


function newestMtime(dir, extensions, ignore = new Set(['node_modules', 'dist', '.git'])) {
  let newest = 0;
  const walk = (current) => {
    let entries;
    try {
      entries = readdirSync(current, {withFileTypes: true});
    } catch {
      return;
    }
    for (const entry of entries) {
      if (ignore.has(entry.name)) continue;
      const full = join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        const mtime = statSync(full).mtimeMs;
        if (mtime > newest) newest = mtime;
      }
    }
  };
  walk(dir);
  return newest;
}

function distIsStale() {
  const distIndex = join(root, 'dist', 'index.html');
  if (!existsSync(distIndex)) return '产物不存在';
  const builtAt = statSync(distIndex).mtimeMs;
  const sources = Math.max(
    newestMtime(join(root, 'app'), ['.ts', '.tsx', '.css']),
    newestMtime(join(root, 'server'), ['.mjs', '.js']),
    existsSync(join(root, 'index.html')) ? statSync(join(root, 'index.html')).mtimeMs : 0,
    existsSync(join(root, 'vite.config.ts')) ? statSync(join(root, 'vite.config.ts')).mtimeMs : 0
  );
  if (sources > builtAt) return '源码比构建产物新';
  const assetsDir = join(root, 'dist', 'assets');
  if (existsSync(assetsDir) && readdirSync(assetsDir).length === 0) return '构建产物不完整';
  return null;
}

function ensureBuild(force) {
  if (force) {
    warn('按要求重新构建');
  } else {
    const reason = distIsStale();
    if (!reason) {
      skip('构建产物是最新的');
      return true;
    }
    warn(`需要构建：${reason}`);
  }
  return runNpm(['run', 'build'], '构建');
}


function openBrowser(url) {
  const [cmd, cmdArgs] =
    process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]]
    : process.platform === 'darwin' ? ['open', [url]]
    : ['xdg-open', [url]];
  try {
    spawn(cmd, cmdArgs, {stdio: 'ignore', detached: true, shell: false}).unref();
    ok(`已在浏览器打开 ${url}`);
  } catch {
    warn(`无法自动打开浏览器，请手动访问 ${url}`);
  }
}

function startServer(port) {
  say('');
  say(`${C.green}${C.bold}  知体已启动${C.reset}`);
  say(`  ${C.dim}本地地址${C.reset}  ${C.cyan}http://localhost:${port}/${C.reset}`);
  say(`  ${C.dim}局域网${C.reset}    ${C.dim}http://<本机 IP>:${port}/${C.reset}`);
  say(`  ${C.dim}停止服务${C.reset}  按 ${C.bold}Ctrl+C${C.reset}${C.dim} 或直接关闭这个窗口${C.reset}`);
  say('');
  say(`  ${C.dim}主导航：自由探索 · AI 导学 · 解剖测验 · 知识题库 · 定位训练 · 关于与来源${C.reset}`);
  say('');

  const envPath = join(root, '.env');
  const nodeArgs = existsSync(envPath)
    ? [`--env-file=${envPath}`, 'server/index.mjs']
    : ['server/index.mjs'];

  const child = spawn(process.execPath, nodeArgs, {
    cwd: root,
    env: {...process.env, PORT: String(port)},
    stdio: 'inherit',
  });

  let stopping = false;
  const shutdown = (signal) => {
    stopping = true;
    if (!child.killed) child.kill(signal);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  child.on('exit', (code, signal) => {
    if (!stopping && code && code !== 0) fail(`服务异常退出（退出码 ${code}）`);
    if (stopping) say(`  ${C.dim}服务已停止${C.reset}`);
    process.exit(stopping || signal ? 0 : (code ?? 0));
  });

  return child;
}


async function main() {
  say('');
  say(`${C.cyan}${C.bold}  知体 · ATLAS AI  一键启动${C.reset}`);
  say(`  ${C.dim}${root}${C.reset}`);
  say('');

  step(1, TOTAL_STEPS, '检查运行环境');
  if (!checkNode()) process.exit(1);
  const port = await resolvePort();
  if (!port) process.exit(1);
  reportAssistantMode();

  if (has('--check-only')) {
    say('');
    say(`${C.green}环境检查通过。${C.reset}去掉 --check-only 即可启动。`);
    return;
  }

  step(2, TOTAL_STEPS, '准备依赖');
  if (!ensureDependencies(has('--force-install'))) process.exit(1);

  step(3, TOTAL_STEPS, '准备构建产物');
  if (!ensureBuild(has('--force-build'))) process.exit(1);

  step(4, TOTAL_STEPS, '启动服务');
  ok('服务进程中，日志如下');

  const url = `http://localhost:${port}/`;
  if (has('--no-open')) skip('按 --no-open 未自动打开浏览器');
  else setTimeout(() => openBrowser(url), 1200);

  startServer(port);
}

main().catch((error) => {
  fail(error?.message ?? String(error));
  process.exit(1);
});
