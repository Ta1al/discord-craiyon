import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Snowflake,
  StringSelectMenuBuilder,
  User
} from "discord.js";
import { ChatInputCommand, registeredStringSelectComponents } from "../../handlers/interaction.js";
import SettingsModel, { Settings } from "../../database/settings.js";

const command: ChatInputCommand = {
  name: "users",
  description: "Edit Whitelisted Users",
  options: [
    {
      type: ApplicationCommandOptionType.User,
      name: "user",
      description: "The user to add"
    }
  ],
  dmPermission: false,
  permissionCheck: "owner",
  execute: async interaction => {
    const user = interaction.options.getUser("user") as User;
    await interaction.deferReply({ ephemeral: true });
    let settings = await SettingsModel.findOne({ guildId: interaction.guildId });
    if (!settings) settings = await SettingsModel.create({ guildId: interaction.guildId });

    if (user) return void addUser(interaction, settings, user);
    else return void listUsers(interaction, settings.whitelistedUsers);
  }
};

export default command;

async function listUsers(interaction: ChatInputCommandInteraction, users: Snowflake[]) {
  if (!users.length) return respond(interaction, "❌ No users are whitelisted")
  const userList = users.map((id, i) => `\`${i + 1}.\` <@!${id}>`).join("\n");
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(interaction.id)
    .setPlaceholder("Select users to remove")
    .setMinValues(1)
    .setMaxValues(users.length)
    .addOptions(users.map((id, i) => ({ label: `${i + 1}. ${id}`, value: id })));

  return void interaction.editReply({
    content: `Whitelisted Users:\n${userList}`,
    components: [{ type: 1, components: [selectMenu] }],
  }).then(() => registerComponent(interaction));
}

async function addUser(
  interaction: ChatInputCommandInteraction,
  settings: Settings,
  user: User
) {
  if (settings.whitelistedUsers.includes(user.id))
    return void respond(interaction, "⚠ That user is already whitelisted");
  if (settings.whitelistedUsers.length === 25)
    return void respond(interaction, "❌ You can't have more than 25 whitelisted users");

  await SettingsModel.updateOne(
    { guildId: interaction.guildId },
    { $push: { whitelistedUsers: user.id } }
  );
  return void respond(interaction, "✅ User added");
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
        { $pull: { whitelistedUsers: { $in: values } } }
      );

      return void interaction.editReply({
        content: `✅ Removed ${values.length} user${values.length === 1 ? "" : "s"}`,
        components: []
      })
    }
  });
}
