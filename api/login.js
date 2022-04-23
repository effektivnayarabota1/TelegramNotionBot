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

export const bot = new Telegraf(process.env.BOT_TOKEN)

export const api = express.Router()

api.get('/login', async (req, res) => {
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
    let parentId = []
    let pages = []
    const notion = await new Client({
        auth: resp.data.access_token
    })
    for (let page of data.results) {
        if (page.parent.type == 'page_id' && !parentId.includes(page.parent.page_id)) {
            parentId.push(page.parent.page_id)
        }
    }
    await bot.telegram.sendMessage(userId, 'Загружаю страницы')
    for (let id of parentId) {
        const title = await discowerTitleById(notion, id)
        await bot.telegram.sendMessage(userId, `${title.toUpperCase()}\n\`\/init ${resp.data.access_token} ${id}\``, {
            parse_mode: 'Markdown'
        })
    }
    await bot.telegram.sendMessage(userId, 'Загрузил странцы. Выберите необходимую и отправьте мне. я ее закреплю')

    res.redirect('https://t.me/notionTelegram_bot')
})
