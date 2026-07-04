const { Service } = require('node-windows');
const path = require('path');

const scriptPath = path.join(__dirname, 'server', 'index.js');

const svc = new Service({
  name: 'RAG Explorer Server',
  script: scriptPath
});

svc.on('uninstall', () => {
  console.log('RAG Explorer Windows service uninstalled successfully.');
});

svc.on('error', (err) => {
  console.error('Service uninstall error:', err);
});

console.log('Uninstalling RAG Explorer Windows service...');
svc.uninstall();
