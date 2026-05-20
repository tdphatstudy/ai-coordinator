param(
  [string]$Mode = "auto",
  [string]$Agents = "all"
)

Write-Host "Running agent-coordinator init..."
node packages/coordinator-cli/bin/ai-coordinator.js init --mode $Mode --agents $Agents
node packages/coordinator-cli/bin/ai-coordinator.js doctor
