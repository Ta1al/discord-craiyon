import "dotenv/config";
import { Client, IntentsBitField } from "discord.js";
import messageHandler from "./handlers/message.js";
import interactionHandler from "./handlers/interaction.js";
import { registeredChatInputCommands } from "./handlers/interaction.js";
import { connect } from "mongoose";
const { TOKEN, GUILD_ID, MONGO_URI } = process.env;

checkEnv();

const client = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages]
});

client.on("ready", async client => {
  console.log(`Logged in as ${client.user.tag}!`);

  mongoose.set("strictQuery", false);
  await connect(MONGO_URI!)
    .then(() => console.log("Connected to MongoDB!"))
    .catch(console.error);

  const commands = Array.from(registeredChatInputCommands).map(([name, command]) => ({
    name,
    description: command.description,
    options: command.options,
    defaultPermission: command.defaultMemberPermissions,
    dmPermission: command.dmPermission
  }));

  const guild = client.guilds.cache.get(GUILD_ID!);
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

