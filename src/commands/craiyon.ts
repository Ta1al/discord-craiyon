import { ApplicationCommandOptionType, AttachmentBuilder } from "discord.js";
import { ChatInputCommand } from "../handlers/interaction.js";
import { Client } from "craiyon";

const craiyon = new Client();

const command: ChatInputCommand = {
  name: "craiyon",
  description: "Generate images with craiyon!",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "The prompt to generate an image from.",
      required: true
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "retries",
      description: "The number of times to retry if something goes wrong.",
      minValue: 0,
      maxValue: 7
    }
  ],
  execute: async interaction => {
    await interaction.deferReply();
    const prompt = interaction.options.getString("prompt", true);
    const maxRetries = interaction.options.getInteger("retries") || 3;
    const result = await craiyon.generate({ prompt, maxRetries });
    const files: AttachmentBuilder[] = [];
    result.images.forEach(image => files.push(new AttachmentBuilder(image.asBuffer())));
    await interaction.editReply({ files });
  }
};

export default command;

