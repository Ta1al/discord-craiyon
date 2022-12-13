import { ChatGPTAPI, ChatGPTConversation, getBrowser, getOpenAIAuth, OpenAIAuth } from "chatgpt";
import { AttachmentBuilder, Message } from "discord.js";

const { OPENAI_EMAIL, OPENAI_PASSWORD } = process.env;
let openAIAuth: OpenAIAuth;
let api: ChatGPTAPI;
let conversation: ChatGPTConversation;
let processing = false;

(async () => {
  openAIAuth = await getAuth();
  api = new ChatGPTAPI(openAIAuth);
  conversation = api.getConversation();
})();

export default async function chatgpt(message: Message) {
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
      const fullResponse = await conversation.sendMessage(message.content, {
        timeoutMs: 5 * 60 * 1000,
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

async function getAuth() {
  if (!OPENAI_EMAIL || !OPENAI_PASSWORD) {
    throw new Error("OPENAI_EMAIL and OPENAI_PASSWORD environment variables are required.");
  }
  const browser = await getBrowser();
  return await getOpenAIAuth({
    email: OPENAI_EMAIL,
    password: OPENAI_PASSWORD,
    browser
  });
}

