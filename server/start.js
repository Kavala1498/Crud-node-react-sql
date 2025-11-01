// server/start.js
const net = require('net');

async function findFreePort(startPort, maxAttempts = 20) {
  let port = Number(startPort) || 3001;
  for (let i = 0; i < maxAttempts; i++) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(port);
    if (free) return port;
    port += 1;
  }
  throw new Error(`No se encontró un puerto libre a partir de ${startPort}`);
}

function isPortFree(port) {
  // Considerar IPv4 e IPv6 para evitar falsos libres cuando otro proceso escucha en '::'
  return new Promise(async (resolve) => {
    const canListen = (host) => new Promise((res) => {
      const srv = net.createServer();
      const done = (ok) => {
        try { srv.close(() => res(ok)); } catch (_) { res(ok); }
      };
      srv.once('error', () => done(false));
      srv.once('listening', () => done(true));
      try {
        srv.listen(port, host);
      } catch (_) {
        res(false);
      }
    });

    const [v4, v6] = await Promise.all([canListen('0.0.0.0'), canListen('::')]);
    resolve(v4 && v6);
  });
}

(async () => {
  const desired = process.argv[2] || process.env.PORT || 3001;
  const port = await findFreePort(desired);
  if (String(port) !== String(desired)) {
    console.log(`[start] Puerto ${desired} ocupado. Usando ${port}`);
  }
  process.env.PORT = String(port);
  require('./index');
})();
