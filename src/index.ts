import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';
config();
// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const channelUsername = process.env.CHANNEL_NAME;
const channelLink = `https://t.me/${channelUsername}`;

const mediaGroups: {
  [key: string]: TelegramBot.InputMediaPhoto[] | TelegramBot.InputMediaVideo[];
} = {};

bot.on('channel_post', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const caption = msg.caption || '';
    if (msg.forward_from_message_id) {
      return;
    }
    const signature = `\n\n\n[Подписывайтесь на канал](${channelLink})`;

    if (!caption && msg.text) {
      await bot.editMessageText(msg.text || '' + signature, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
      });
    } else {
      await bot.editMessageCaption(caption || '' + signature, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
      });
    }
    // Удаляем оригинальное сообщение
    // await bot.deleteMessage(chatId, messageId.toString());
    /* 
    // Проверяем наличие фото
    if (msg.photo) {
      const photo = msg.photo[msg.photo.length - 1].file_id; // Берем последнее фото (самое качественное)
      await bot.sendPhoto(chatId, photo, {
        caption: caption + signature,
        parse_mode: 'Markdown',
      });
    }
    // Проверяем наличие видео
    else if (msg.video) {
      const video = msg.video.file_id;
      await bot.sendVideo(chatId, video, {
        caption: caption + signature,
        parse_mode: 'Markdown',
      });
    }
    // Обработка текстовых сообщений
    else if (msg.text) {
      await bot.sendMessage(chatId, msg.text + signature, {
        parse_mode: 'Markdown',
      });
    } */
  } catch (error) {
    console.error('Произошла ошибка при обработке сообщения:', error);
  }
});

console.log('Бот запущен...');
