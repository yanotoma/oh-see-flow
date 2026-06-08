import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const perfFile = path.join(directory, ".osf", "perf-monitor.jsonl")
  const timings: Map<string, number> = new Map()

  return {
    "tool.execute.before": async (input, output) => {
      // Start timing
      const key = `${input.tool}-${Date.now()}`
      timings.set(key, Date.now())
      output._perfKey = key
    },

    "tool.execute.after": async (input, output) => {
      // End timing and calculate metrics
      const key = output._perfKey
      if (key && timings.has(key)) {
        const startTime = timings.get(key)
        const duration = Date.now() - startTime
        timings.delete(key)

        const tokens = output.usage?.total_tokens || 0
        const tokensPerSecond = duration > 0 ? (tokens / duration) * 1000 : 0

        const entry = {
          timestamp: new Date().toISOString(),
          tool: input.tool,
          duration,
          tokens,
          tokensPerSecond: Math.round(tokensPerSecond * 100) / 100,
        }

        fs.appendFileSync(perfFile, JSON.stringify(entry) + "\n")
      }
    },
  }
}) satisfies Plugin
