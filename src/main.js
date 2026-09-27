import { formatVersion } from './utils.js';

// Lab 6: change these three values, commit, push, and watch your site update.
const team = 'Team 01';
const version = '1.0.0';
const message = 'We shipped this through our first CI/CD pipeline 🚀';

document.querySelector('#team').textContent = team;
document.querySelector('#version').textContent = formatVersion(version);
document.querySelector('#message').textContent = message;
