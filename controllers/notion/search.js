export default async function search(notion, title, PageId) {
    const search = await notion.search({
        query: title
    }).then(res => res.results)
    if (!search.length) return false
    return search.filter(page => page.parent.page_id == PageId)
};
