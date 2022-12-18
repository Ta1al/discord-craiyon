import "dotenv/config";
import { Client, IntentsBitField } from "discord.js";
import interactionHandler, { registeredChatInputCommands } from "./handlers/interaction.js";

const { TOKEN, GUILD_ID } = process.env;
checkEnv();

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages],
  allowedMentions: { parse: [], repliedUser: true },
});

client.on("ready", async client => {
  console.log(`Logged in as ${client.user.tag}!`);
  const guild = client.guilds.cache.get(GUILD_ID!);
  if (!guild) throw new Error("Guild not found");

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

client.on("interactionCreate", interactionHandler);

client.login(TOKEN);

function checkEnv() {
  if (!TOKEN) throw new Error("TOKEN is not defined in .env file");
}

