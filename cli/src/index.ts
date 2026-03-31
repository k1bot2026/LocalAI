#!/usr/bin/env node
// cli/src/index.ts
import { program } from "commander";
import { readFileSync } from "node:fs";
import { formatResponse } from "./format.js";

const GATEWAY_URL = process.env.LOCALAI_GATEWAY_URL ?? "http://localhost:5577";

interface QueryOptions {
  file?: string;
  skill?: string;
  system?: string;
  chat?: boolean;
}

async function query(prompt: string, options: QueryOptions): Promise<void> {
  const body: Record<string, unknown> = { prompt };

  if (options.file) {
    body.file_path = options.file;
    try {
      body.file_content = readFileSync(options.file, "utf-8");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error reading file: ${msg}`);
      process.exit(1);
    }
  }

  if (options.skill) body.skill = options.skill;
  if (options.system) body.system = options.system;

  try {
    const response = await fetch(`${GATEWAY_URL}/v1/localai/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Gateway error (${response.status}): ${text}`);
      process.exit(1);
    }

    const data = await response.json();
    console.log(formatResponse(data));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to reach LocalAI gateway at ${GATEWAY_URL}: ${msg}`);
    console.error("Is the gateway running? Start it with: npm run dev:gateway");
    process.exit(1);
  }
}

async function chatMode(): Promise<void> {
  const readline = await import("node:readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("LocalAI Chat (type 'exit' to quit)\n");

  const askQuestion = (): void => {
    rl.question("\x1b[36myou>\x1b[0m ", async (input) => {
      const trimmed = input.trim();
      if (trimmed === "exit" || trimmed === "quit") {
        rl.close();
        return;
      }
      if (!trimmed) {
        askQuestion();
        return;
      }
      await query(trimmed, {});
      console.log();
      askQuestion();
    });
  };

  askQuestion();
}

async function readStdin(): Promise<string | null> {
  if (process.stdin.isTTY) return null;

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8").trim() || null;
}

program
  .name("local-ai")
  .description("Local AI assistant powered by Qwen2.5-Coder-7B via Ollama")
  .version("0.1.0");

program
  .argument("[prompt...]", "The prompt to send to the local model")
  .option("-f, --file <path>", "Include a file as context")
  .option("-s, --skill <name>", "Use a specific skill prompt chain")
  .option("--system <prompt>", "Additional system prompt")
  .option("-c, --chat", "Enter interactive chat mode")
  .action(async (promptParts: string[], options: QueryOptions) => {
    if (options.chat) {
      await chatMode();
      return;
    }

    const stdinContent = await readStdin();
    const prompt = promptParts.join(" ");

    if (!prompt && !stdinContent) {
      program.help();
      return;
    }

    const fullPrompt = stdinContent ? `${prompt}\n\n${stdinContent}` : prompt;
    await query(fullPrompt, options);
  });

program.parse();
