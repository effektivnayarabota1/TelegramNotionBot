export default async function search(notion, title) {
    const search = await notion.search({
        query: title
    }).then(res => res.results)
    if (!search.length) return false
    return search
};