import "dotenv/config";
import { Client, IntentsBitField } from "discord.js";
import messageHandler from "./handlers/message.js";
import interactionHandler, { registeredChatInputCommands } from "./handlers/interaction.js";
import mongoose, { connect } from "mongoose";
import SettingsModel from "./database/settings.js";

const { TOKEN, GUILD_ID, MONGO_URI, SESSION_TOKEN } = process.env;
checkEnv();

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
  allowedMentions: { parse: [], repliedUser: true },
});

client.on("ready", async client => {
  console.log(`Logged in as ${client.user.tag}!`);
  const guild = client.guilds.cache.get(GUILD_ID!);
  if (!guild) throw new Error("Guild not found");

  mongoose.set("strictQuery", false);
  await connect(MONGO_URI!)
    .then(() => console.log("Connected to MongoDB!"))
    .catch(console.error);

  const settings = await SettingsModel.findOne({ guildId: guild!.id });
  if (!settings) await SettingsModel.create({ guildId: guild!.id });

  const commands = Array.from(registeredChatInputCommands).map(([name, command]) => ({
    name,
    description: command.description,
    options: command.options,
    defaultPermission: command.defaultMemberPermissions,
    dmPermission: command.dmPermission
  }));

  guild?.commands
    .set(commands)
    .then(c =>
      console.log(
        `Registered ${c.size} command(s) ${guild ? `for guild ${guild.name}` : "globally"}`
      )
    )
    .catch(console.error);
});

client.on("messageCreate", messageHandler);
client.on("interactionCreate", interactionHandler);

client.login(TOKEN);

function checkEnv() {
  if (!TOKEN) throw new Error("TOKEN is not defined in .env file");
  if (!GUILD_ID) throw new Error("GUILD_ID is not defined in .env file");
  if (!MONGO_URI) throw new Error("MONGO_URI is not defined in .env file");
}

