import { ChatInputCommand } from "../handlers/interaction.js";


const command: ChatInputCommand = {
  name: "ping",
  description: "Replies with pong!",
  execute: async interaction => {
    await interaction.reply("Pong!");
  }
};

export default command;