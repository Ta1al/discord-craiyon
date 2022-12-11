import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  GuildChannel,
  Snowflake,
  TextChannel
} from "discord.js";
import { ChatInputCommand } from "../../handlers/interaction.js";
import SettingsModel, { Settings } from "../../database/settings.js";

const command: ChatInputCommand = {
  name: "channels",
  description: "Edit Whitelisted Channels",
  options: [
    {
      type: ApplicationCommandOptionType.Channel,
      name: "channel",
      description: "The channel to add"
    }
  ],
  dmPermission: false,
  permissionCheck: "owner",
  execute: async interaction => {
    const channel = interaction.options.getChannel("channel") as TextChannel;
    let settings = await SettingsModel.findOne({ guildId: interaction.guildId });
    if (!settings) settings = await SettingsModel.create({ guildId: interaction.guildId });

    if (channel) return void addChannel(interaction, settings, channel);
    else return void listChannels(interaction, settings.channels);
  }
};

export default command;

async function listChannels(interaction: ChatInputCommandInteraction, channels: Snowflake[]) {
  const channelList = channels.map((id, i) => `\`${i + 1}.\` <#${id}>`).join("\n");
  await interaction.reply({
    content: `Whitelisted Channels:\n${channelList || "None"}`,
    ephemeral: true
  });
}

async function addChannel(
  interaction: ChatInputCommandInteraction,
  settings: Settings,
  channel: GuildChannel
) {
  if (!channel.isTextBased())
    return void interaction.reply({
      content: "❌ That channel is not a text channel",
      ephemeral: true
    });
  if (settings.channels.includes(channel.id)) {
    await interaction.reply({
      content: "⚠ That channel is already whitelisted",
      ephemeral: true
    });
    return;
  }

  await SettingsModel.updateOne(
    { guildId: interaction.guildId },
    { $push: { channels: channel.id } }
  );
  await interaction.reply({
    content: `Added ${channel.toString()} to the whitelist`,
    ephemeral: true
  });
}

