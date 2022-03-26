import {
    Client
} from "@notionhq/client"
import dotenv from 'dotenv'
dotenv.config()

const notion = new Client({
    auth: process.env.NOTION_KEY
})
const PageId = process.env.NOTION_PAGE_ID

export class TelegramToNotion {
    static MessageToArray(text) {
        return text.match(/^.*/gm)
    }

    static formatTime(date) {
        return date.toLocaleDateString('ru-RU', {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    }

    static message(ctx) {
        const baseNote = ctx.update.message.reply_to_message
        const newMessageText = ctx.update.message.text
        if (!baseNote) this.create(ctx)
        // else {
        //     if (newMessageText == '-') this.destroy(ctx, baseNote)
        //     else if (newMessageText.match(/^-/gm)) this.overwrite(ctx, baseNote)
        //     else this.add(ctx, baseNote)
        // }

    }

    static async create(ctx) {
        const msgArray = this.MessageToArray(ctx.message.text)
        const newBody = msgArray.slice(1).join("\n")
        console.log(this.formatTime(new Date()))
        try {
            // await notion.pages.create({
            //     parent: {
            //         database_id: databaseId
            //     },
            //     properties: {
            //         Name: {
            //             title: [{
            //                 "text": {
            //                     "content": msgArray[0]
            //                 }
            //             }]
            //         },
            //         Date: {
            //             date: {
            //                 start: new Date().toISOString().split('T')[0],
            //             }
            //         }
            //     },
            //     children: [{
            //         object: 'block',
            //         type: 'paragraph',
            //         paragraph: {
            //             rich_text: [{
            //                 type: 'text',
            //                 text: {
            //                     content: newBody
            //                 },
            //             }, ],
            //         },
            //     }, ]
            // })

            await notion.pages.create({
                parent: {
                    // database_id: databaseId
                    page_id: PageId
                },
                properties: {
                    title: [{
                        "text": {
                            "content": msgArray[0]
                        }
                    }]
                    // Name: {
                    //     title: [{
                    //         "text": {
                    //             "content": msgArray[0]
                    //         }
                    //     }]
                    // },
                    // Date: {
                    //     date: {
                    //         start: new Date().toISOString().split('T')[0],
                    //     }
                    // }
                },
                children: [{
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{
                            type: 'text',
                            text: {
                                content: newBody
                            },
                        }, ],
                    },
                }, ]
            })

            await ctx.reply('Заметка добавлена')
            // console.log(response)
        } catch (error) {
            console.error(error.body)
        }
    }

    static showList(ctx) {
        (async () => {
            // const response = await notion.blocks.children.list({
            //     block_id: 'b7bb1bb711c74cb4a4f77f359837a389',
            //   });

            // const response = await notion.blocks.retrieve({
            //     block_id: PageId,
            // });

            const blockId = PageId;
            const response = await notion.blocks.children.list({
                block_id: blockId,
                page_size: 50,
            });
            console.log(response);
        })()
    }
}