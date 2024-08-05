require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs');
const paymentService = require('./services/paymentService');

// Inicialização do Express
const app = express();
app.use(bodyParser.json());

// Configuração do Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// Comando /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Bem-vindo ao nosso E-commerce! Use /products para ver nossos produtos.');
});

// Comando /products
bot.onText(/\/products/, (msg) => {
    const chatId = msg.chat.id;
    const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'views/products.json')));

    let productMessage = 'Aqui estão nossos produtos:\n';
    products.forEach((product, index) => {
        productMessage += `${index + 1}. ${product.name} - ${product.price} USD\n`;
        productMessage += `Clique para comprar: /buy_${product.id}\n\n`;
    });

    bot.sendMessage(chatId, productMessage);
});

// Callback query handler
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data.startsWith('buy_')) {
        const productId = data.split('_')[1];
        const products = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'views/products.json')));
        const product = products.find(p => p.id === productId);

        if (product) {
            const paymentUrl = await paymentService.createPayment(product.price, product.name);
            bot.sendMessage(chatId, `Clique no link para pagar: ${paymentUrl}`);
        } else {
            bot.sendMessage(chatId, 'Produto não encontrado.');
        }
    }
});

// Inicialização do servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
