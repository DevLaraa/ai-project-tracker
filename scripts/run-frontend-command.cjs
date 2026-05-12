const { spawn } = require('node:child_process');
const path = require('node:path');

const frontendCommand = process.argv[2];

if (!frontendCommand) {
  console.error('Missing frontend npm script name.');
  process.exit(1);
}

const child = spawn('npm', ['run', frontendCommand], {
  cwd: path.join(__dirname, '..', 'frontend'),
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
