import { Awaitable, Message } from "discord.js";

export default async function messageHandler(message: Message): Promise<void> {
  return void await message.reply("Hello, world!");
}
