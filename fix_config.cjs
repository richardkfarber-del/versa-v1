const fs = require('fs');
const filePath = '/home/node/.openclaw/openclaw.json';
try {
  const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // 1. Set the default model to prevent compaction errors
  config.agents.defaults.model = "google/gemini-3-pro-preview";

  // 2. Add Martian Manhunter if he's not already in the list
  const manhunterExists = config.agents.list.some(agent => agent.id === 'manhunter');
  if (!manhunterExists) {
    config.agents.list.push({
      "id": "manhunter",
      "name": "Martian Manhunter",
      "workspace": "/app/workspace",
      "agentDir": "/home/node/.openclaw/agents/manhunter/agent",
      "model": "google/gemini-3-pro-preview"
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
  console.log('Configuration successfully updated.');

} catch (error) {
  console.error('Failed to update configuration:', error);
  process.exit(1);
}
