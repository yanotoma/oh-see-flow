import type { Plugin } from "@opencode-ai/plugin"

export default (async ({ client, project, directory, $ }) => {
  const SECRET_PATTERNS = [
    /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret\s*[:=]\s*['"][^'"]+['"]/gi,
    /token\s*[:=]\s*['"][^'"]+['"]/gi,
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
    /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
    /ghp_[a-zA-Z0-9]{36}/g,  // GitHub token
    /sk-[a-zA-Z0-9]{48}/g,   // OpenAI key
  ]

  return {
    "tool.execute.before": async (input, output) => {
      // Check for secrets in bash commands
      if (input.tool === "bash" && output.args?.command) {
        const command = output.args.command
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(command)) {
            throw new Error("Blocked: Potential secret detected in command. Use environment variables instead.")
          }
        }
      }
    },

    "tool.execute.after": async (input, output) => {
      // Check for secrets in outputs
      if (output.result && typeof output.result === "string") {
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.test(output.result)) {
            output.result = output.result.replace(pattern, "[REDACTED]")
          }
        }
      }
    },
  }
}) satisfies Plugin
