import { Interaction } from "discord.js";

export default async function interactionHandler(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;
  return void (await interaction.reply("Hello, world!"));
}

