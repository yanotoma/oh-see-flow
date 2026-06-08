import type { Plugin } from "@opencode-ai/plugin"
import * as fs from "fs"
import * as path from "path"

export default (async ({ client, project, directory, $ }) => {
  const CAPABILITY_ERRORS = {
    vision: [
      /can't process images/i,
      /cannot process images/i,
      /image input not supported/i,
      /vision not available/i,
      /multimodal not supported/i,
    ],
    large_context: [
      /context length exceeded/i,
      /maximum context/i,
      /too many tokens/i,
    ],
    code_execution: [
      /code interpreter not available/i,
      /cannot execute code/i,
    ],
  }

  return {
    "tool.execute.after": async (input, output) => {
      // Check for capability errors in model response
      if (output.error && typeof output.error === "string") {
        const capability = detectCapabilityError(output.error)

        if (capability) {
          // Load capability model config
          const configPath = path.join(directory, ".osf", "capability-models.json")
          let capabilityModels: Record<string, string> = {}

          if (fs.existsSync(configPath)) {
            capabilityModels = JSON.parse(fs.readFileSync(configPath, "utf-8"))
          }

          const capabilityModel = capabilityModels[capability]

          if (capabilityModel) {
            // Log the capability dispatch
            const logEntry = {
              timestamp: new Date().toISOString(),
              capability,
              fromModel: output.model || "unknown",
              toModel: capabilityModel,
              error: output.error,
            }

            const logFile = path.join(directory, ".osf", "capability-dispatches.jsonl")
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n")

            // Signal to dispatch capability subagent
            output._dispatchSubagent = {
              type: capability,
              model: capabilityModel,
              reason: `Capability '${capability}' not available, dispatching ${capability} subagent`,
            }
          }
        }
      }
    },
  }
}) satisfies Plugin

function detectCapabilityError(error: string): string | null {
  for (const [capability, patterns] of Object.entries(CAPABILITY_ERRORS)) {
    for (const pattern of patterns) {
      if (pattern.test(error)) {
        return capability
      }
    }
  }
  return null
}
