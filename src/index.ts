import "dotenv/config";
import { Client, IntentsBitField } from "discord.js";
import messageHandler from "./handlers/message.js";
import interactionHandler from "./handlers/interaction.js";
import { registeredChatInputCommands } from "./handlers/interaction.js";
const { TOKEN, GUILD_ID } = process.env;

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages]
});

client.on("ready", async client => {
  console.log(`Logged in as ${client.user.tag}!`);

  const guild = client.guilds.cache.get(GUILD_ID!);
  const commands = Array.from(registeredChatInputCommands).map(([name, command]) => ({
    name,
    description: command.description,
    options: command.options,
    defaultPermission: command.defaultMemberPermissions,
    dmPermission: command.dmPermission
  }));

  (guild ?? client.application).commands
    .set(commands)
    .then(c =>
      console.log(`Registered ${c.size} command(s) ${guild ? `for guild ${guild.name}` : "globally"}`)
    )
    .catch(console.error);
});

client.on("messageCreate", messageHandler);
client.on("interactionCreate", interactionHandler);

client.login(TOKEN);

