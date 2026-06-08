import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const logFile = path.join(directory, ".osf", "task-log.jsonl")

  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool === "task") {
        const entry = {
          timestamp: new Date().toISOString(),
          tool: input.tool,
          agent: output.args?.subagent_type || "unknown",
          task: output.args?.description || "unknown",
          success: !output.error,
          duration: output.duration || 0,
        }

        fs.appendFileSync(logFile, JSON.stringify(entry) + "\n")
      }
    },
  }
}) satisfies Plugin
