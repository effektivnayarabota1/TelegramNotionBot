import {
    Client
} from "@notionhq/client"

export default async function (ctx) {
    const notion = new Client({
        auth: ctx.session.notionTokken
    })
    const PageId = ctx.session.PageId
    return [notion, PageId]
}