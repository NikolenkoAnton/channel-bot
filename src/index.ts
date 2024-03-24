import TelegramBot, { MessageEntityType } from 'node-telegram-bot-api';
import { config } from 'dotenv';
config();
// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const channelUsername = process.env.CHANNEL_NAME;
const channelLink = `https://t.me/${channelUsername}`;
//#region
const convertEntitiesToHTML = (text, entities) => {
  if (!entities) return text;

  // Сортируем entities в обратном порядке по offset, чтобы не нарушить индексы при замене
  const sortedEntities = [...entities].sort((a, b) => b.offset - a.offset);

  // Преобразуем каждую entity в HTML
  for (const entity of sortedEntities) {
    const { offset, length, type, url } = entity;
    let html;

    switch (type) {
      case 'bold':
        html = `<b>${text.substr(offset, length)}</b>`;
        break;
      case 'italic':
        html = `<i>${text.substr(offset, length)}</i>`;
        break;
      case 'code':
        html = `<code>${text.substr(offset, length)}</code>`;
        break;
      case 'pre':
        html = `<pre>${text.substr(offset, length)}</pre>`;
        break;
      case 'text_link':
        html = `<a href="${url}">${text.substr(offset, length)}</a>`;
        break;
      case 'underline':
        html = `<u>${text.substr(offset, length)}</u>`;
        break;
      case 'text_mention':
        html = `<a href="tg://user?id=${entity.user.id}">${text.substr(
          offset,
          length
        )}</a>`;
        break;
      case 'blockquote':
        // HTML не поддерживает блок цитат напрямую, но можно использовать тег <blockquote>
        html = `<blockquote>${text.substr(offset, length)}</blockquote>`;
        break;
      // Добавьте здесь другие типы, если необходимо
      default:
        html = text.substr(offset, length);
    }

    // Заменяем исходный текст на HTML
    text = text.substring(0, offset) + html + text.substring(offset + length);
  }

  return text;
};
//#endregion

bot.on('channel_post', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const caption = msg.caption || '';
    if (msg.forward_from_message_id) {
      return;
    }
    const signatureCaption = `\n\n[War Zone ✙ ➔ подписаться](${channelLink})`;
    // const urlRegex = /https?:\/\/[^\s]+/g;

    const signature = `\n\n<a href="${channelLink}">War Zone ✙ ➔ подписаться</a>`;
    const urlRegex = /https?:\/\/[^\s]+/g;

    if (!caption && msg.text) {
      const hasOtherLinks = Boolean(
        msg.entities &&
          msg.entities.some(
            (entity) => entity.type === 'text_link' || entity.type === 'url'
          )
      );
      const formattedText = convertEntitiesToHTML(msg.text, msg.entities);
      await bot.editMessageText(formattedText + signature, {
        chat_id: chatId,
        message_id: messageId,
        // caption_entities: msg.entities,
        // entities: msg.entities,
        parse_mode: 'HTML',
        disable_web_page_preview: !hasOtherLinks,
      });
    } else {
      if (!caption && msg.media_group_id) {
        return;
      }
      // const formattedText = convertEntitiesToHTML(msg.text, msg.entities);
      const caption_signature = `War Zone ✙ ➔ подписаться`;
      const caption_signature_entity = {
        offset: caption.length + 2,
        length: caption_signature.length,
        type: 'text_link' as MessageEntityType,
        url: channelLink,
      };
      const entities = msg.caption_entities || [];
      entities.push(caption_signature_entity);
      await bot.editMessageCaption(
        (msg.caption || '') + '\n\n' + caption_signature,
        {
          chat_id: chatId,
          message_id: messageId,
          caption_entities: entities,
        }
      );
    }
  } catch (error) {
    console.error('Произошла ошибка при обработке сообщения:', error);
  }
});

console.log('Бот запущен...');

// Функция для преобразования entities в Markdown
