const { execSync } = require('child_process');
try {
  console.log('--- Current Directory ---');
  console.log(process.cwd());
  console.log('--- df -h ---');
  console.log(execSync('df -h').toString());
  console.log('--- ls -la /app / ---');
  console.log(execSync('ls -la /app /').toString());
  console.log('--- git status ---');
  console.log(execSync('git status 2>&1 || true').toString());
  console.log('--- find . ---');
  console.log(execSync('find . -maxdepth 3').toString());
} catch (err) {
  console.error(err);
}
