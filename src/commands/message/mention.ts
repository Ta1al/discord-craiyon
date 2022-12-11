import { MessageCommand } from "../../handlers/message.js";
import SettingsModel from "../../database/settings.js";
import chatgpt from "../../gpt/index.js";

const command: MessageCommand = {
  name: "mention",
  execute: async message => {
    if (!message.guild) return;
    const settings = await SettingsModel.findOne({ guildId: message.guild.id });
    if (
      settings?.channels.includes(message.channel.id) &&
      settings?.whitelistedUsers.includes(message.author.id)
    ) {
      chatgpt(message, settings.sessionToken);
    }
  }
};

export default command;

