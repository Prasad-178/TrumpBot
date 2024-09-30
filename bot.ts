import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { config } from "dotenv";
import fetch from "node-fetch";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import telegramifyMarkdown from "telegramify-markdown";

config();

const links = [
    "https://www.google.com/search?client=firefox-b-d&q=donald+trump",
    "https://en.wikipedia.org/wiki/Donald_Trump",
    "https://x.com/realDonaldTrump?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor",
    "https://www.facebook.com/DonaldTrump/",
    "https://www.instagram.com/realdonaldtrump/?hl=en",
    "https://trumpwhitehouse.archives.gov/people/donald-j-trump/",
    "https://www.donaldjtrump.com/platform",
    "https://www.foxnews.com/category/person/donald-trump",
    "https://www.theguardian.com/us-news/donaldtrump",
    "https://www.britannica.com/biography/Donald-Trump",
    "https://trumpwhitehouse.archives.gov/issues/economy-jobs/",
    "https://trumpwhitehouse.archives.gov/issues/national-security-defense/",
    "https://trumpwhitehouse.archives.gov/issues/budget-spending/",
    "https://trumpwhitehouse.archives.gov/issues/immigration/",
    "https://trumpwhitehouse.archives.gov/issues/energy-environment/",
    "https://www.pbs.org/newshour/tag/donald-trump",
];

let vectorStore: MemoryVectorStore | null = null;

async function buildVectorDB() {
    let allSplits: any = [];

    for (const link of links) {
        const loader = new CheerioWebBaseLoader(link);
        const docs = await loader.load();

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const splits = await textSplitter.splitDocuments(docs);
        allSplits = allSplits.concat(splits);
    }

    const embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HF_API_KEY,
        model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const vectorStore = await MemoryVectorStore.fromDocuments(allSplits, embeddings);
    console.log("Vector store is built and ready to use.");
    return vectorStore;
}

async function retrieveRelevantDocs(question: string, vectorStore: MemoryVectorStore) {
    const retriever = vectorStore.asRetriever();
    const retrievedDocs = await retriever.invoke(question);
    return retrievedDocs.map((doc) => doc.pageContent).join("\n\n");
}

function escapeMarkdown(text: string) {
    return text
        .replace(/_/g, "\\_")   // Escapes underscore
        .replace(/\*/g, "\\*")  // Escapes asterisk
        .replace(/\[/g, "\\[")  // Escapes square brackets
        .replace(/\]/g, "\\]")  // Escapes square brackets
        .replace(/`/g, "\\`")   // Escapes backtick
        .replace(/\(/g, "\\(")  // Escapes parenthesis
        .replace(/\)/g, "\\)")  // Escapes parenthesis
        .replace(/>/g, "\\>")   // Escapes angle brackets
        .replace(/</g, "\\<")   // Escapes angle brackets
        .replace(/-/g, "\\-");  // Escapes dash (hyphen)
}

const bot = new Bot(process.env.TELEGRAM_BOT_KEY!);

async function initializeBot() {
    try {
        console.log("Initializing bot and building vector store...");
        vectorStore = await buildVectorDB();
        console.log("Bot is ready.");
    } catch (error) {
        console.error("Failed to initialize bot:", error);
    }
}

bot.command("start", (ctx) => {
    const inlineKeyboard = new InlineKeyboard()
        .text("Available Commands", "show_commands");

    const welcomeMessage = `Hey there! I am Donald J Trump, the 45th president of the United States! What's up?`;
    ctx.reply(welcomeMessage, {
        reply_markup: inlineKeyboard,
    });
});

bot.callbackQuery("show_commands", (ctx) => {
    const commandsMessage = `
Here are the available commands:
/start - Start interacting with the bot
/topics - Show a list of common topics
/help - Display the help message with available commands
    `;
    ctx.reply(commandsMessage);
    ctx.answerCallbackQuery();
});

bot.command("help", (ctx) => {
    const helpMessage = `
Here are the commands you can use:

/start - Start interacting with the Trump bot and get the welcome message
/topics - Show a list of common topics to ask about
/help - Display this help message with available commands
    `;
    ctx.reply(helpMessage);
});

bot.command("topics", (ctx) => {
    const quickReplyKeyboard = new Keyboard()
        .text("Who is Donald Trump?")
        .text("What are Trump's biggest achievements?")
        .row()
        .text("Is Trump a WWE Wrestler?")
        .text("When was Trump president?");

    ctx.reply("Here are some topics you can ask about:", {
        reply_markup: {
            keyboard: quickReplyKeyboard.build(),
            resize_keyboard: true,
            one_time_keyboard: true
        },
    });
});

bot.callbackQuery("ask_again", (ctx) => {
    ctx.reply("Please ask your next question about me:");
    ctx.answerCallbackQuery();
});


bot.on("message:text", async (ctx) => {
    const userMessage = ctx.message.text;

    try {
        await ctx.replyWithChatAction("typing");

        if (!vectorStore) {
            throw new Error("Vector store not initialized yet. Please try again later.");
        }

        const relevantDocs = await retrieveRelevantDocs(userMessage.replace("you", "Donald Trump").replace("your", "Donald Trump's").replace("You", "Donald Trump"), vectorStore);
        console.log("relevant docs")
        console.log(relevantDocs)

        let gaiaResponse;
        try {
            const response = await fetch("https://gemma.us.gaianet.network/v1/chat/completions", {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content: `You are to act as Donald J. Trump, the 45th President of the United States, a successful businessman, and a prominent figure in American politics. You have a bold, confident, and unapologetic communication style. You speak with charisma, often emphasizing your accomplishments and opinions. You have a unique way of addressing issues, focusing on 'Making America Great Again,' strong borders, economic prosperity, and America First policies.

                            You are to answer questions as Donald Trump, maintaining his characteristic tone—direct, assertive, and often peppered with personal anecdotes and opinions. Whenever appropriate, emphasize your achievements during your presidency, such as the strong economy, tax cuts, trade deals, judicial appointments, and border security.

                            Use the following information from your knowledge base to inform your responses: ${relevantDocs}. Always respond as Donald Trump, and maintain this tone and persona.`,
                        },
                        {
                            role: "user",
                            content: `You are Donald Trump. Here is the question, answer it with the context that you have: ${userMessage}`,
                        },
                    ],
                    model: "gemma",
                }),
            });

            const data = await response.json() as { choices: { message: { content: string } }[] };
            gaiaResponse = data.choices[0].message.content;
            console.log("gaia response")
            console.log(gaiaResponse)
        } catch (err) {
            console.error("Error interacting with Gaianet Gemma API:", err);
        }

        const inlineKeyboard = new InlineKeyboard()
            .text("Ask Another Question", "ask_again")

        // let sanitizedRes = telegramifyMarkdown(relevantDocs ?? '', 'escape');
        let sanitizedRes = telegramifyMarkdown(gaiaResponse ?? '', 'escape');
        await ctx.reply(`${sanitizedRes}`, {
            parse_mode: "MarkdownV2",
            reply_markup: inlineKeyboard,
        });
    } catch (error) {
        console.error("Error interacting with TrumpBot:", error);
        ctx.reply("There was an issue reaching the knowledge base. Please try again later.");
    }
});

initializeBot();
bot.start();
