import { ChatGPTAPIBrowser } from "chatgpt";
import { AttachmentBuilder, Message } from "discord.js";

const { OPENAI_EMAIL, OPENAI_PASSWORD } = process.env;
if (!OPENAI_EMAIL || !OPENAI_PASSWORD) {
  throw new Error("OPENAI_EMAIL and OPENAI_PASSWORD environment variables are required.");
}
let api: ChatGPTAPI, processing: boolean;

(async () => {
  api = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL!,
    password: process.env.OPENAI_PASSWORD!
  });
  await api.init();
})();

export default async function chatgpt(message: Message) {
  if (processing) return message.reply("⌛ I'm processing another message, please wait.");
  else {
    processing = true;

    const msg = await message.reply("⌛ Processing...");
    try {
      await api.ensureAuth();
      message.channel.sendTyping();
      const fullResponse = await api.sendMessage(message.content, { timeoutMs: 5 * 60 * 1000 });

      msg.edit(makeResponse(fullResponse));
    } catch (error) {
      console.error(error);
      await msg.edit("❌ An error occurred while processing your message.");
    } finally {
      processing = false;
    }
  }
}

function makeResponse(answer: string) {
  let response: Object = { content: answer };
  if (answer.length > 2000)
    response = { content: "", embeds: [{ description: answer, color: 0x2f3136 }] };
  if (answer.length > 4096) {
    const attachment = new AttachmentBuilder(Buffer.from(answer));
    const file = attachment.setName("response.txt");
    response = { content: "", files: [file] };
  }
  return response;
}

