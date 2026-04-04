const fs = require('fs');
const config = JSON.parse(fs.readFileSync('/home/node/.openclaw/openclaw.json', 'utf8'));
config.agents.list.push({
  "id": "manhunter",
  "name": "Martian Manhunter",
  "workspace": "/app/workspace",
  "agentDir": "/home/node/.openclaw/agents/manhunter/agent",
  "model": "google/gemini-3-pro-preview"
});
fs.writeFileSync('/home/node/.openclaw/openclaw.json', JSON.stringify(config, null, 2));
