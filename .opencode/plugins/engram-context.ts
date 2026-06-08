import type { Plugin } from "@opencode-ai/plugin"

export default (async ({ client, project, directory, $ }) => {
  return {
    "tool.execute.before": async (input, output) => {
      // Auto-inject relevant Engram memories into subagent prompts
      if (output.args?.prompt && input.tool === "task") {
        const searchTerms = extractSearchTerms(output.args.prompt)
        if (searchTerms.length > 0) {
          const memories = await searchEngram(searchTerms)
          if (memories.length > 0) {
            output.args.prompt = injectMemories(output.args.prompt, memories)
          }
        }
      }
    },
  }
}) satisfies Plugin

function extractSearchTerms(prompt: string): string[] {
  // Extract key terms from the prompt for memory search
  const words = prompt.split(/\s+/).filter(w => w.length > 4)
  return [...new Set(words)].slice(0, 5)
}

async function searchEngram(terms: string[]): Promise<string[]> {
  // This would integrate with Engram's search API
  // For now, return empty array
  return []
}

function injectMemories(prompt: string, memories: string[]): string {
  const memoryBlock = memories.map(m => `- ${m}`).join("\n")
  return `${prompt}\n\n## Relevant Memories\n${memoryBlock}`
}
