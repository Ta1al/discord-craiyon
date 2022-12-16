import { Message } from "discord.js";
import { readdir } from "fs/promises";

export const registeredMessageCommands = new Map<string, MessageCommand>();
(async () => {
  const commands = await readdir("./src/commands/message");
  for (const command of commands) {
    const { default: messageCommand } = (await import(
      `../commands/message/${command.split(".")[0]}.js`
    )) as { default: MessageCommand };
    registeredMessageCommands.set(messageCommand.name, messageCommand);
  }
})();

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
  return message.content.replace(`<@${message.client.user.id}>`, "").trim();
}

