import Message from "../models/message.js"
import telegramController from "../controllers/telegram/controller.js"
import notionPageId from "../services/notionPageId.js"
import reply from '../controllers/telegram/reply.js'

export default class router {
    static async help(ctx) {
        ctx.replyWithMarkdown(`
*БЫСТРЫЕ ЗАМЕТКИ В NOTION* 

/init – Авторизироваться.
/list – Показать все страницы.

▸   *ДОБАВИТЬ НОВУЮ СТРАНИЦУ*
Для добавления новой страницы необходимо отправить сообщение в формате:

\`\`\`
    Заголовок 1
    Параграф
    Новый абзац

    Новый параграф
    Новый абзац
\`\`\`

▸   *РАЗВЕРНУТЬ*
Ответить на сообщение бота со знаком " . "

▸   *ДОПОЛНИТЬ*
Ответить необходимым дополнением.

▸   *УДАЛИТЬ*
Ответить со знаком "-"

▸   *ВОССТАНОВИТЬ*
Ответить со знаком "+"

На данный момент можно работать с текстовыми и голосовыми сообщениями на обычных страницах.

_by @effectivnayaRabota1_
`)
    }

    static async init(ctx) {
        const message = ctx.message.text
        const chatId = ctx.message.chat.id
        const saltRounds = 10
        const notionTokken = message.split(' ')[1]
        const PageId = message.split(' ')[2]
        if (message.split(' ').length == 1) {
            ctx.replyWithMarkdown(`[АВТОРИЗИРОВАТЬСЯ](https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${process.env.NOTION_CLIENT_ID}&state=ID${chatId}&response_type=code)`)
            return
        }
        if (notionTokken && PageId) {
            ctx.session = {
                notionTokken: notionTokken,
                PageId: PageId
            }
            // await ctx.replyWithMarkdown(`\`${message}\``)
            await ctx.replyWithMarkdown(`Инициализация прошла успешно.\n/list – Развернуть страницу`)
        } else await ctx.reply(`Страница уже инициализирована.`)
        return
    }

    static async list(ctx) {
        try {
            if (!ctx.session) throw new Error('Инициализируйте страницу, отправив /init, или восстановите регистрацию, я её закреплял.')

            const [notion, PageId] = await notionPageId(ctx)
            const message = new Message()
            let res, option
            if (PageId) res = await telegramController.show(notion, PageId, message)
            await reply.listReply(ctx, res, option)
        } catch (e) {
            ctx.reply(e.message)
        }
    }

    static async message(ctx) {
        try {
            if (ctx.message.text && ctx.message.text.match(/^\/init/im)) return
            if (ctx.message.pinned_message && ctx.message.pinned_message.text.match(/^\/init/im)) return
            if (!ctx.session) throw new Error('Инициализируйте страницу, отправив /init, или восстановите регистрацию, я её закреплял.')

            let res, option
            const [notion, PageId] = await notionPageId(ctx)
            if (!ctx.message.reply_to_message) {
                //Новое сообщение, без отвечаемого.
                let message = new Message()
                await message.init(ctx, 'notes')
                const text = message.cli.text
                if (text == '.') throw new Error('Ответьте на сообщение бота, чтобы показать заметку.')
                else if (text == '-') throw new Error('Ответьте на сообщение бота, чтобы удалить заметку.')
                else if (text == '+') throw new Error('Ответьте на сообщение бота, чтобы восстановить заметку.')
                else [res, option] = await telegramController.add(notion, PageId, message).catch(() => {
                    throw new Error('Ошибка добавления сообщения.')
                })
            } else {
                //Ответ на сообщение бота.
                let message = new Message()
                await message.init(ctx, 'paragraphs').catch(() => {
                    throw new Error('Ошибка инициализации сообщения.')
                })
                const text = message.cli.text
                if (text == '.') res = await telegramController.show(notion, null, message).catch(() => {
                    throw new Error('Ошибка инициализации сообщения.')
                })
                else if (text == '-')[res, option] = await telegramController.remove(notion, message).catch(() => {
                    throw new Error('Ошибка удаления сообщения.')
                })
                else if (text == '+')[res, option] = await telegramController.restore(notion, message).catch(() => {
                    throw new Error('Ошибка восстановления сообщения.')
                })
                else [res, option] = await telegramController.add(notion, null, message).catch(() => {
                    throw new Error('Ошибка добавления сообщения.')
                })
            }
            if (Array.isArray(res)) {
                for (let r of res) {
                    await reply.listReply(ctx, r, option)
                }
                return
            } else return await reply.listReply(ctx, res, option)

        } catch (e) {
            ctx.reply(e.message)
        }
    }
}
