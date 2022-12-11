import { Message } from "discord.js";
import { readdir } from "fs/promises";

export const registeredMessageCommands = new Map<string, MessageCommand>();
const commands = await readdir("./src/commands/message", { withFileTypes: false });
for (const command of commands) {
  const { default: MessageCommand } = await import(
    `../commands/message/${command.split(".ts")[0]}.js`
  );
  registeredMessageCommands.set(MessageCommand.name, MessageCommand);
}

export default async function messageHandler(message: Message): Promise<void> {
  if (message.author.bot) return;
  try {
    if (message.mentions.has(message.client.user)) {
      message.content = removeMention(message);
      return registeredMessageCommands.get("mention")?.execute(message);
    }
  } catch (error) {
    console.error(error);
  }
}

export interface MessageCommand {
  name: string;
  execute: (message: Message) => Promise<void>;
}

function removeMention(message: Message<boolean>): string {
  return message.content.replace("<@" + message.client.user.id + ">", "").trim();
}

