import { ApplicationCommandOptionType } from "discord.js";
import { ChatInputCommand } from "../handlers/interaction.js";


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
      maxValue: 7,
    }
  ],
  execute: async interaction => {
    await interaction.reply("Pong!");
  }
};

export default command;