if (Number(process.versions.node.split('.')[0]) < 24) {
  console.error('Please install Node.js 24 LTS, then reopen your terminal.');
  process.exit(1);
}
