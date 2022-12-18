import { ChatGPTAPIBrowser } from "chatgpt";
import { AttachmentBuilder, ChatInputCommandInteraction } from "discord.js";

const { OPENAI_EMAIL, OPENAI_PASSWORD } = process.env;
if (!OPENAI_EMAIL || !OPENAI_PASSWORD) {
  throw new Error("OPENAI_EMAIL and OPENAI_PASSWORD environment variables are required.");
}
let api: ChatGPTAPIBrowser, processing: boolean;

(async () => {
  await newBrowser();
})();
setInterval(async () => {
  await newBrowser();
}, 1000 * 60 * 60);

async function newBrowser() {
  api = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL!,
    password: process.env.OPENAI_PASSWORD!
  });
  await api.initSession();
}

export default async function chatgpt(interaction: ChatInputCommandInteraction) {
  const message = interaction.options.getString("message", true);
  if (processing) return interaction.reply("⌛ I'm processing another message, please wait.");
  else {
    processing = true;

    await interaction.deferReply();
    try {
      let partialResponse: string;
      const interval = setInterval(() => {
        if (partialResponse) interaction.editReply(makeResponse(partialResponse));
      }, 1500);
      const fullResponse = await api.sendMessage(message, {
        timeoutMs: 5 * 60 * 1000,
        onProgress: partial => {
          partialResponse = partial.response;
        }
      });
      clearInterval(interval);
      setTimeout(() => {
        interaction.editReply(makeResponse(fullResponse.response));
      }, 1500);
    } catch (error) {
      let { message: err } = error as { message: string };
      console.error(error);

      await interaction.editReply(
        `❌ An error occurred while processing your message.\n\`\`\`\n${err}\`\`\``
      );
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

