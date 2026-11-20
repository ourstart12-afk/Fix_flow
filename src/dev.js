import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createNetServer } from 'node:net';
import { createServer } from 'vite';

const sourceFolder = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(sourceFolder, '..');
let apiPort = Number(process.env.PORT || 4000);
let apiUrl = `http://127.0.0.1:${apiPort}`;

let apiProcess;
let viteServer;
let stopping = false;

async function apiSupportsPasswordReset(port = apiPort) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    if (!response.ok) return false;
    const health = await response.json();
    return health.capabilities?.passwordReset === true;
  } catch {
    return false;
  }
}

async function findAvailablePort(startingPort) {
  for (let port = startingPort; port < startingPort + 50; port += 1) {
    const available = await new Promise((resolvePort) => {
      const probe = createNetServer();
      probe.once('error', () => resolvePort(false));
      probe.listen(port, '127.0.0.1', () => probe.close(() => resolvePort(true)));
    });
    if (available) return port;
  }
  throw new Error('No free local API port was found. Close another local server and try again.');
}

async function waitForApi() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await apiSupportsPasswordReset()) return;
    if (apiProcess.exitCode !== null) throw new Error('The API server stopped during startup.');
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }
  throw new Error('The API server did not become ready.');
}

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;

  if (viteServer) await viteServer.close();
  if (apiProcess && apiProcess.exitCode === null) {
    apiProcess.kill();
    await new Promise((resolveExit) => apiProcess.once('exit', resolveExit));
  }
}

process.once('SIGINT', () => void stop(0));
process.once('SIGTERM', () => void stop(0));

try {
  const managerEmail = process.env.FIXFLOW_MANAGER_EMAIL || 'manager@fixflow.com';
  const managerPassword = process.env.FIXFLOW_MANAGER_PASSWORD || 'Manager123!';
  const managerName = process.env.FIXFLOW_MANAGER_NAME || 'Facility Manager';

  if (!(await apiSupportsPasswordReset())) {
    const requestedPort = apiPort;
    apiPort = await findAvailablePort(requestedPort);
    apiUrl = `http://127.0.0.1:${apiPort}`;
    if (apiPort !== requestedPort) {
      console.log(`Port ${requestedPort} is already in use; starting the current API on ${apiPort}.`);
    }
    apiProcess = spawn(process.execPath, ['src/backend/server.js'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        PORT: String(apiPort),
        FIXFLOW_MANAGER_EMAIL: managerEmail,
        FIXFLOW_MANAGER_PASSWORD: managerPassword,
        FIXFLOW_MANAGER_NAME: managerName,
      },
      stdio: 'inherit',
    });
    apiProcess.once('exit', (code) => {
      if (!stopping) {
        console.error('The API server stopped unexpectedly.');
        void stop(code || 1);
      }
    });
    await waitForApi();
  } else {
    console.log('Using the existing FixFlow API server.');
  }

  process.env.VITE_API_BASE_URL = apiUrl;
  viteServer = await createServer({
    root: projectRoot,
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 5173 },
  });
  await viteServer.listen();
  const address = viteServer.httpServer.address();
  console.log(`\n  ➜  Customer Side:      http://127.0.0.1:${address.port}`);
  console.log(`  ➜  Manager Dashboard:   http://127.0.0.1:${address.port}/manager/dashboard`);
  console.log(`  ➜  FixFlow API:         ${apiUrl}/api/health`);
  console.log(`  ➜  Manager Login:       ${managerEmail} / ${managerPassword}\n`);
} catch (error) {
  console.error(error.message);
  await stop(1);
}
