import { Snowflake } from "discord.js";
import { Schema, model } from "mongoose";

const SettingsSchema = new Schema<Settings>({
  guildId: { type: String, required: true },
  channels: { type: [String], required: true },
  whitelistedUsers: { type: [String], required: true },
  sessionToken: { type: String, required: true }
});

export default model<Settings>("settings", SettingsSchema);

interface Settings {
  guildId: Snowflake;
  channels: Snowflake[];
  whitelistedUsers: Snowflake[];
  sessionToken: string;
}