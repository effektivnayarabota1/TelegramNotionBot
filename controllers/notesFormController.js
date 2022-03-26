import {
    Note
} from "../models/note.js"

export class NotesFormController {
    static index(req, res) {
        Note.find().then((notes) => {
            res.render('listOfNotes', {
                main_title: 'List of Notes',
                notes: notes
            })
        }).catch((error) => {
            res.status(400).json({
                error: error
            })
        })
    }

    static show(req, res) {
        Note.findOne({
            _id: req.params.id
        }).then((note) => {
            res.render('notes/show', {
                main_title: note.title,
                note: note
            })
        }).catch((error) => {
            res.status(400).json({
                error: error
            })
        })
    }

    static update(req, res) {
        const newNote = new Note({
            _id: req.params.id,
            title: req.body['note_title'],
            body: req.body['note_body'],
        })
        Note.updateOne({
            _id: req.params.id
        }, newNote).then(() => {
            res.redirect('/notes')
        }).catch((error) => {
            res.status(400).json({
                error: error
            })
        })
    }

    static destroy(req, res) {
        Note.deleteOne({
            _id: req.params.id
        }).then(() => {
            res.redirect('/notes')
        }).catch((error) => {
            res.status(400).json({
                error: error
            })
        })
    }

    static destroyAll(req, res) {
        Note.deleteMany().then(() => {
            res.redirect('/notes')
        }).catch((error) => {
            res.status(400).json({
                error: error
            })
        })
    }

    static showCreateForm(req, res) {
        res.render('createNote', {
            main_title: 'Create Note'
        })
    }

    static create(req, res) {
        const note = new Note({
            title: req.body['note_title'],
            body: req.body['note_body'],
            date: new Date()
        })
        note.save().then(() => {
            res.redirect('/notes')
        }).catch((error) => {
            res.status(400).json({
                error: error
            })
        })
    }
}