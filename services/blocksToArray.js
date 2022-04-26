import notionController from '../controllers/notion/controller.js'
import idToUrl from './idToUrl.js'

export default async function blocksToArr(blocks, parentId) {
    let outputArray = []
    for (let block of blocks) {
        let title, text, voiceUrl, url, has_children, photoUrl, caption
        if (block.type == 'audio') {
            voiceUrl = block.audio.external.url
            url = await idToUrl(block.id)
        } else if (block.type == 'paragraph') {
            if (!block.paragraph.rich_text.length) {
                await notionController.remove({
                    bot: {
                        id: block.id
                    }
                }, 'empty')
                continue
            }
            if (block.paragraph.rich_text[0].type == 'text') {
                text = block.paragraph.rich_text[0].text.content
                url = await idToUrl(block.id)
                has_children = block.has_children
            }
        } else if (block.type == 'child_page') {
            title = block.child_page.title
            url = await idToUrl(block.id)
            has_children = block.has_children
        } else if (block.type == 'image') {
            photoUrl = block.image.external.url
            caption = block.image.caption
            url = await idToUrl(block.id)
        } else throw new Error('Данный тип сообщения не обрабатывается.')

        outputArray.push({
            title: title,
            text: text,
            voiceUrl: voiceUrl,
            photoUrl: photoUrl,
            caption: caption,
            parentUrl: await idToUrl(parentId),
            url: url,
            has_children: has_children,
        })
    }
    return outputArray
}
