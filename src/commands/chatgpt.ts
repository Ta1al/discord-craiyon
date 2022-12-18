import { ApplicationCommandOptionType } from "discord.js";
import { ChatInputCommand } from "../handlers/interaction.js";
// import chatgpt from "../util/chatgpt.js";

const command: ChatInputCommand = {
  name: "chatgpt",
  description: "Interact with ChatGPT",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "message",
      description: "The message to send to ChatGPT",
      required: true
    }
  ],
  execute: async interaction => {
    return void interaction.reply("This command is currently disabled.");
    // return void chatgpt(interaction);
  }
};

export default command;