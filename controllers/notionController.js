import {
    Client
} from "@notionhq/client"
const notion = new Client({
    auth: 'secret_iZi9PbvdRElfIxSS91lc9qL1nHaIKygXh31rkf7bdkT'
})

export class Notion {
    static async idToUrl(id) {
        return `https://www.notion.so/${id.split('-').join('')}`
    }
    static async search(title) {
        const search = await notion.search({
            query: title
        }).then(res => res.results)
        if (!search.length) return false
        return search
    }

    static async create(PageId, title, blocks) {
        await notion.pages.create({
            parent: {
                page_id: PageId
            },
            properties: {
                title: [{
                    "text": {
                        "content": title
                    }
                }]
            }
        }).then(res => {
            this.parent = {
                title: title,
                url: res.url,
                id: res.id
            }
        })

        if (blocks) await this.appendChilds(this.parent.id, blocks)
        return this
    }

    static async remove(id) {
        this.childrens = []
        await notion.blocks.delete({
            block_id: id,
        }).then(async res => {
            console.log(res)
            let text
            res.has_children ? text = res.child_page.title : text = res.paragraph.rich_text[0].text.content
            this.childrens.push({
                text: text,
                url: await this.idToUrl(res.id),
                has_children: res.has_children
            })
        })
        return this.childrens
    }

    static async appendChilds(parentId, blocks) {
        this.childrens = []
        let outputArray = []
        for (let block of blocks) {
            outputArray.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{
                        type: 'text',
                        text: {
                            content: block
                        },
                    }, ],
                },
            })
        }
        await notion.blocks.children.append({
            block_id: parentId,
            children: outputArray
        }).then(async res => {
            const childrens = res.results
            for (let child of childrens) {
                this.childrens.push({
                    text: child.paragraph.rich_text[0].text.content,
                    url: await this.idToUrl(child.id),
                })
            }
        })
        return this.childrens
    }

    static async showAllBlocks(parentId) {
        return await notion.blocks.children.list({
            block_id: parentId,
            page_size: 50,
        }).then(res => {
            console.log(res)
            return res.results
        })
    }

    static async discowerTitleById(pageId) {
        let title
        await notion.pages.retrieve({
            page_id: pageId
        }).then(res => {
            console.log(res)
            if (res.archived) throw new Error("Страница удалена.")
            title = res.properties.title.title[0].text.content
        })
        return title
    }
}