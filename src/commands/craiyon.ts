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
    await interaction.reply(
      "<a:loading:781902642267029574> This should not take long (up to 2 minutes)..."
    );
    const prompt = interaction.options.getString("prompt", true);
    const maxRetries = interaction.options.getInteger("retries") || 3;
    craiyon
      .generate({ prompt, maxRetries }) //
      .then(async result => {
        const files: AttachmentBuilder[] = [];
        result.images.forEach(image => files.push(new AttachmentBuilder(image.asBuffer())));
        return await interaction.editReply({ content: "", files });
      })
      .catch(async error => {
        console.error(error);
        return await interaction.editReply(`❌ An error occurred.\n\`\`\`\n${error.message}\`\`\``);
      });
  }
};

export default command;

