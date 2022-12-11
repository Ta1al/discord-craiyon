import { ChatGPTAPI } from "chatgpt";
import { AttachmentBuilder, Message } from "discord.js";

let controller: AbortController | undefined;
let token = process.env.TOKEN!;
let api = new ChatGPTAPI({
  sessionToken: token
});
let conversation = api.getConversation();
let processing = false;
export default async function chatgpt(message: Message, newToken: string) {
  if (newToken !== token) {
    token = newToken;
    api = new ChatGPTAPI({
      sessionToken: token
    });
    conversation = api.getConversation();
  }

  if (processing) return message.reply("⌛ I'm processing another message, please wait.");
  else {
    processing = true;

    const msg = await message.reply("⌛ Processing...");
    try {
      await api.ensureAuth();
      message.channel.sendTyping();
      let partialResponse: string;
      const interval = setInterval(function () {
        if (typeof partialResponse !== "undefined") {
          msg.edit(makeResponse(partialResponse));
        }
      }, 1500);
      controller = new AbortController();
      const fullResponse = await conversation.sendMessage(message.content, {
        timeoutMs: 5 * 60 * 1000,
        abortSignal: controller.signal,
        onProgress: partial => {
          partialResponse = partial;
        }
      });

      

      clearInterval(interval);
      setTimeout(() => {
        msg.edit(makeResponse(fullResponse));
      }, 1500);
    } catch (error) {
      console.error(error);
      await msg.edit("❌ An error occurred while processing your message.");
    } finally {
      controller = undefined;
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
