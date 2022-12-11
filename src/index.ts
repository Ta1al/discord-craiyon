import "dotenv/config";
import { Client, IntentsBitField } from "discord.js";

const { TOKEN } = process.env;

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages]
});

client.on("ready", client => console.log(`Logged in as ${client.user?.tag}!`));

client.login(TOKEN);

