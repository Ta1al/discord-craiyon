import { ApplicationCommandOptionType } from "discord.js";
import settings from "../../database/settings.js";
import { ChatInputCommand } from "../../handlers/interaction.js";

const command: ChatInputCommand = {
  name: "sessiontoken",
  description: "Update the session token",
  dmPermission: false,
  permissionCheck: "owner",
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "token",
      description: "The new session token",
      required: true,
    }
  ],

  execute: async (interaction) => {
    const token = interaction.options.getString("token", true);
    await interaction.deferReply({ ephemeral: true });
    await settings.updateOne(
      { guildId: interaction.guildId! },
      { $set: { sessionToken: token } }
    )
    await interaction.editReply("Session token updated.");
  }
}

export default command;