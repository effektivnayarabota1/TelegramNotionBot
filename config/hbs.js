import hbs from 'hbs'
import path from 'path'

const __dirname = path.resolve()

export function setupHBS(app) {
    hbs.registerPartials(path.join(__dirname, 'views/partials'))
    hbs.registerHelper('formatTime', function (date) {
        return date.toLocaleDateString('ru-RU', {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        })
    })
}