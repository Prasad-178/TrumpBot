# TrumpBot

This repository contains a Telegram bot that impersonates Donald J. Trump, the 45th President of the United States. The bot answers questions in the style of Trump, using relevant documentation and data sources to provide informative and entertaining responses. The bot is powered by a Retrieval-Augmented Generation (RAG) system using the Gaianet Gemma LLM model and fetches relevant documents to enhance responses.

Telegram Bot Link: [https://t.me/YourTrumpBot](https://t.me/YourTrumpBot)

## Features

- Acts as Donald J. Trump, answering questions with his characteristic bold and confident style.
- Retrieves relevant documents from various sources such as news articles, social media profiles, and more, and builds a vector database using Hugging Face embeddings to retrieve information using RAG.
- Integrates with the Gaianet Gemma LLM to generate responses informed by real-world information.
- Supports Telegram Markdown formatting in replies and ensures proper escaping for Telegram’s MarkdownV2 format.
- Includes inline keyboards for asking more questions and quick-reply keyboards for popular Trump topics.

## Prerequisites

- **Node.js** version 16 or later
- **Telegram Bot API Token**: Create a bot via [BotFather](https://core.telegram.org/bots#botfather) and get the API token.
- **Hugging Face API Key**: Obtain your API key from [Hugging Face](https://huggingface.co/settings/tokens).

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourgithubusername/TrumpBot.git
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables:
    ```bash
    TELEGRAM_BOT_KEY=your-telegram-bot-key
    HF_API_KEY=your-hugging-face-api-key
    ```

4. Build the bot and start it:
    ```bash
    npx tsc
    node bot.js
    ```

## Usage

- After starting the bot, you can interact with it by sending commands or questions.
- Use `/start` to receive a welcome message and instructions on how to ask questions.
- Use `/topics` to get a list of common topics you can ask about Donald Trump.
- The bot will parse your questions, retrieve relevant documents, and provide responses in the style of Donald Trump based on the vector database and Gaianet Gemma LLM.

### Example Commands

- `/start`: Displays the welcome message and provides a brief introduction of Trump.
- `/topics`: Provides quick-reply buttons for commonly asked topics like Trump's achievements, presidency timeline, and more.

### Markdown Formatting in Telegram

To ensure proper formatting, the bot uses the `telegramify-markdown` package, which automatically escapes any problematic characters in Markdown and makes it safe for Telegram.

## Libraries Used

- **grammy**: A modern and lightweight framework for building Telegram bots.
- **node-fetch**: For making API requests.
- **langchain**: Used for loading documents and performing text splitting for vector search.
- **@langchain/community/embeddings/hf**: Hugging Face embeddings for document vectors.
- **@langchain/vectorstores/memory**: In-memory vector store for storing document embeddings.
- **telegramify-markdown**: A helper to safely convert Markdown into Telegram-safe MarkdownV2 format.
- **dotenv**: For managing environment variables.

## Development

To contribute or make changes, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with a descriptive message.
4. Push your branch and create a pull request.

## Troubleshooting

- Ensure you have provided the correct API keys in your `.env` file.
- If the bot responds with "Vector store not initialized yet," the document loading or vector creation might not have completed. Wait for the bot to fully initialize before testing it.
- If you encounter a "Bad Request: can't parse entities" error, check if the response text is not properly escaped for Markdown. This is handled automatically by the `telegramify-markdown` package, but certain cases may still arise.

## License

This project is open source and available under the MIT License.
