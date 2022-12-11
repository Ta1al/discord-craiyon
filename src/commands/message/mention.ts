import { MessageCommand } from "../../handlers/message.js";

const command: MessageCommand = {
  name: "mention",
  execute: async message => {
    await message.reply("Hello!");
  }
};

export default command;
