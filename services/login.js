import {
    Telegraf,
    Markup
} from 'telegraf'
import {
    Client
} from "@notionhq/client"
import discowerTitleById from "../controllers/notion/discowerTitleById.js"
import express from 'express'
import axios from 'axios'
import smile from './smile.js'
import Romb from './romb.js'

export const login = express.Router()

login.get("/", (req, res) => res.send('home'))

login.get("/login", async (req, res) => {
    const bot = new Telegraf(process.env.BOT_TOKEN)

    const code = req.query.code
    const userId = req.query.state.slice(2)

    const resp = await axios({
        method: "POST",
        url: "https://api.notion.com/v1/oauth/token",
        auth: {
            username: process.env.NOTION_CLIENT_ID,
            password: process.env.NOTION_CLIENT_SECRET
        },
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            code,
            grant_type: "authorization_code"
        },
    });

    const {
        data
    } = await axios({
        method: "POST",
        url: "https://api.notion.com/v1/search",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resp.data.access_token}`,
            "Notion-Version": "2022-02-22",
        },
        data: {
            //   filter: {
            //         property: "object",
            //         value: "database"
            //     }
        },
    });

    const notion = await new Client({
        auth: resp.data.access_token
    })

    await bot.telegram.sendMessage(userId, `\`${await smile()}\``, {
        parse_mode: 'Markdown'
    })

    let pinned = false
    let databases = ''
    for (let page of data.results) {
        const romb = await Romb()
        if (page.parent.type == 'workspace') {
            if (page.object == 'page') {
                const title = page.properties.title.title[0].text.content
                await bot.telegram.sendMessage(userId, `*▸   ${title.toUpperCase()}*\n\`\/init ${resp.data.access_token} ${page.id}\``, {
                    parse_mode: 'Markdown'
                }).then(async res => {
                    const messageId = res.message_id
                    if (!pinned) {
                        pinned = true
                        await bot.telegram.unpinAllChatMessages(userId)
                        await bot.telegram.pinChatMessage(userId, messageId, {
                            disable_notification: true
                        })
                    }
                })
            } else if (page.object == 'database') {
                const title = page.title[0].plain_text
                if (databases) databases += ', '
                databases += title
            }
        }
    }

    if (databases) await bot.telegram.sendMessage(userId, `Страницы _${databases}_ не будут добавленны. Database находится в разработке, можно редактировать только обычные страницы.`, {
        parse_mode: 'Markdown'
    })
    await bot.telegram.sendMessage(userId, 'Выберите необходимую страницу , `нажав на моноширную строку` и отправьте мне, я ее закреплю', {
        parse_mode: 'Markdown'
    })

    res.send('OK')
});
