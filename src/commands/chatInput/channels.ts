import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Snowflake,
  StringSelectMenuBuilder,
  TextBasedChannel
} from "discord.js";
import { ChatInputCommand, registeredStringSelectComponents } from "../../handlers/interaction.js";
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
    const channel = interaction.options.getChannel("channel") as TextBasedChannel;
    await interaction.deferReply({ ephemeral: true });
    let settings = await SettingsModel.findOne({ guildId: interaction.guildId });
    if (!settings) settings = await SettingsModel.create({ guildId: interaction.guildId });

    if (channel) return void addChannel(interaction, settings, channel);
    else return void listChannels(interaction, settings.channels);
  }
};

export default command;

async function listChannels(interaction: ChatInputCommandInteraction, channels: Snowflake[]) {
  if (!channels.length) return respond(interaction, "❌ No channels are whitelisted")
  const channelList = channels.map((id, i) => `\`${i + 1}.\` <#${id}>`).join("\n");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Select channels to remove")
    .setMinValues(1)
    .setMaxValues(25)
    .addOptions(channels.map((id, i) => ({ label: `${i + 1}. ${id}`, value: id })));

  return void interaction.editReply({
    content: `Whitelisted Channels:\n${channelList}`,
    components: [{ type: 1, components: [selectMenu] }],
  }).then(() => registerComponent(interaction));
}

async function addChannel(
  interaction: ChatInputCommandInteraction,
  settings: Settings,
  channel: TextBasedChannel
) {
  if (!channel.isTextBased())
    return void respond(interaction, "❌ That channel is not a text channel");
  if (settings.channels.includes(channel.id))
    return void respond(interaction, "⚠ That channel is already whitelisted");
  if (settings.channels.length === 25)
    return void respond(interaction, "❌ You can't have more than 25 whitelisted channels");


  await SettingsModel.updateOne(
    { guildId: interaction.guildId },
    { $push: { channels: channel.id } }
  );
  return void respond(interaction, "✅ Channel added");
}

async function respond(interaction: ChatInputCommandInteraction, content: string) {
  await interaction.editReply({ content });
}

function registerComponent(interaction: ChatInputCommandInteraction) {
  registeredStringSelectComponents.set(interaction.id, {
    allowedUsers: [interaction.user.id],
    execute: async selectInteraction => {
      const { values } = selectInteraction;
      await selectInteraction.deferUpdate();
      await SettingsModel.updateOne(
        { guildId: interaction.guildId },
        { $pull: { channels: { $in: values } } }
      );

      return void selectInteraction.update({
        content: `✅ Removed ${values.length} channel${values.length === 1 ? "" : "s"}`,
        components: []
      })
    }
  });
}
