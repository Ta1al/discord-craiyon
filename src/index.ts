import "dotenv/config";
import { Client, IntentsBitField } from "discord.js";
import messageHandler from "./handlers/message";
import interactionHandler from "./handlers/interaction";

const { TOKEN } = process.env;

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages]
});

client.on("ready", client => console.log(`Logged in as ${client.user?.tag}!`));

client.on("messageCreate", messageHandler);
client.on("interactionCreate", interactionHandler);

client.login(TOKEN);

