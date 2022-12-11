import {
  Interaction,
  ApplicationCommandOptionData,
  PermissionResolvable,
  ChatInputCommandInteraction,
  Snowflake,
  ButtonInteraction
} from "discord.js";
import { readdir } from "fs/promises";

export const registeredChatInputCommands = new Map<string, ChatInputCommand>();
export const registeredButtonComponents = new Map<string, ButtonComponent>();

const commands = await readdir("./src/commands/chatInput");
for (const command of commands) {
  const { default: ChatInputCommand } = await import(
    `../commands/chatInput/${command.split(".ts")[0]}.js`
  );
  registeredChatInputCommands.set(ChatInputCommand.name, ChatInputCommand);
}

export default function interactionHandler(interaction: Interaction): void {
  try {
    if (interaction.isChatInputCommand())
      return void registeredChatInputCommands.get(interaction.commandName)?.execute(interaction);
    if (interaction.isButton())
      return void registeredButtonComponents.get(interaction.customId)?.execute(interaction);
  } catch (error) {
    console.error(error);
  }
}

export interface ChatInputCommand {
  name: string;
  description: string;
  options?: ApplicationCommandOptionData[];
  defaultMemberPermissions?: PermissionResolvable;
  dmPermission?: boolean;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface ButtonComponent {
  allowedUsers?: "all" | Snowflake[];
  execute: (interaction: ButtonInteraction) => Promise<void>;
}

