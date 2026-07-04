const { Service } = require('node-windows');
const path = require('path');

const scriptPath = path.join(__dirname, 'server', 'index.js');

const svc = new Service({
  name: 'RAG Explorer Server',
  description: 'RAG Explorer 24/7 background server for PDF, file, and URL ingestion with RAG queries.',
  script: scriptPath,
  env: [
    { name: 'NODE_ENV', value: 'production' }
  ]
});

svc.on('install', () => {
  console.log('RAG Explorer Windows service installed successfully.');
  svc.start();
  console.log('Service started. It will now run 24/7, even when no user is logged in.');
  console.log('Open http://localhost:3001 in your browser.');
});

svc.on('alreadyinstalled', () => {
  console.log('Service is already installed.');
});

svc.on('error', (err) => {
  console.error('Service install error:', err);
});

console.log('Installing RAG Explorer as a Windows service...');
svc.install();
