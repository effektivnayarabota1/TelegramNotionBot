export default async function appendParagraph(notion, message) {
    return await notion.blocks.children.append({
        block_id: parentId,
        children: blocks
    }).then(async res => {
        output = await blocksToArr(res.results, parentId)
    })
};
