import {
  Snowflake,
  Interaction,
  ButtonInteraction,
  PermissionResolvable,
  ChatInputCommandInteraction,
  ApplicationCommandOptionData,
  StringSelectMenuInteraction
} from "discord.js";
import { readdir } from "fs/promises";

export const registeredChatInputCommands = new Map<string, ChatInputCommand>();
export const registeredButtonComponents = new Map<string, ButtonComponent>();
export const registeredStringSelectComponents = new Map<string, StringSelectComponent>();

const commands = await readdir("./src/commands/chatInput");
for (const command of commands) {
  const { default: ChatInputCommand } = await import(
    `../commands/chatInput/${command.split(".ts")[0]}.js`
  );
  registeredChatInputCommands.set(ChatInputCommand.name, ChatInputCommand);
}

export default async function interactionHandler(interaction: Interaction): Promise<void> {
  if (interaction.isChatInputCommand()) {
    const command = registeredChatInputCommands.get(interaction.commandName);
    if (!command) {
      return void interaction.reply({ content: "❌ Command not found.", ephemeral: true });
    }
    if (command.permissionCheck) {
      const hasPermission = await checkPermissions(command, interaction);

      if (!hasPermission) {
        return void interaction.reply({
          content: "❌ You are not allowed to use this command.",
          ephemeral: true
        });
      }
    }
    return void command.execute(interaction).catch(console.error);
  }

  if (interaction.isButton()) {
    const component = registeredButtonComponents.get(interaction.customId);
    if (!component) {
      return void interaction.reply({ content: "❌ Component not found.", ephemeral: true });
    }
    if (component.allowedUsers !== "all" && !component.allowedUsers.includes(interaction.user.id)) {
      return void interaction.reply({
        content: "❌ You are not allowed to use this component.",
        ephemeral: true
      });
    }

    return void component.execute(interaction).catch(console.error);
  }

  if (interaction.isStringSelectMenu()) {
    const component = registeredStringSelectComponents.get(interaction.customId);
    if (!component) {
      return void interaction.reply({ content: "❌ Component not found.", ephemeral: true });
    }
    if (component.allowedUsers !== "all" && !component.allowedUsers.includes(interaction.user.id)) {
      return void interaction.reply({
        content: "❌ You are not allowed to use this component.",
        ephemeral: true
      });
    }

    return void component.execute(interaction).catch(console.error);
  }
}

export interface ChatInputCommand {
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
  defaultMemberPermissions?: PermissionResolvable;
  dmPermission?: boolean;
  permissionCheck?: "owner" | ((interaction: ChatInputCommandInteraction) => Promise<boolean>);
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

interface BaseComponent {
  allowedUsers: "all" | Snowflake[];
}

export interface ButtonComponent extends BaseComponent {
  execute: (interaction: ButtonInteraction) => Promise<void>;
}

export interface StringSelectComponent extends BaseComponent {
  execute: (interaction: StringSelectMenuInteraction) => Promise<void>;
}

async function checkPermissions(
  command: ChatInputCommand,
  interaction: ChatInputCommandInteraction
) {
  if (command.permissionCheck === "owner") return interaction.user.id === process.env.OWNER_ID;
  else return await command.permissionCheck!(interaction);
}

