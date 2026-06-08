import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const statsFile = path.join(directory, ".osf", "model-stats.jsonl")
  const stats: Map<string, any> = new Map()

  return {
    "chat.message": async (input, output) => {
      // Track token usage per agent
      const agent = input.agent || "default"
      const tokens = output.usage?.total_tokens || 0

      if (!stats.has(agent)) {
        stats.set(agent, { totalTokens: 0, requests: 0 })
      }

      const agentStats = stats.get(agent)
      agentStats.totalTokens += tokens
      agentStats.requests += 1

      // Persist to file
      const entry = {
        timestamp: new Date().toISOString(),
        agent,
        tokens,
        totalTokens: agentStats.totalTokens,
        requests: agentStats.requests,
      }

      fs.appendFileSync(statsFile, JSON.stringify(entry) + "\n")
    },
  }
}) satisfies Plugin
