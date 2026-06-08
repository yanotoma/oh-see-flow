import type { Plugin } from "@opencode-ai/plugin"

export default (async ({ client, project, directory, $ }) => {
  const results: Map<string, any> = new Map()

  return {
    "tool.execute.after": async (input, output) => {
      if (input.tool === "task" && output.result) {
        const taskId = output.args?.description || "unknown"
        results.set(taskId, {
          result: output.result,
          timestamp: new Date().toISOString(),
          success: !output.error,
        })
      }
    },

    "chat.message": async (input, output) => {
      // Format collected results for orchestrator
      if (results.size > 0) {
        const summary = formatResults(results)
        // Inject into context if relevant
        results.clear()
      }
    },
  }
}) satisfies Plugin

function formatResults(results: Map<string, any>): string {
  return Array.from(results.entries())
    .map(([task, data]) => `### ${task}\n${JSON.stringify(data.result, null, 2)}`)
    .join("\n\n")
}
