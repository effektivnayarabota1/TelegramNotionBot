import express from 'express'
import {
    NotesFormController
} from "../controllers/notesFormController.js"

export const router = express.Router()

router.get('/', (req, res) => {
    res.redirect('/notes')
})

router.get('/notes', (req, res) => {
    NotesFormController.index(req, res)
})

router.get('/notes/:id', (req, res) => {
    NotesFormController.show(req, res)
})

router.put('/notes/:id', (req, res) => {
    NotesFormController.update(req, res)
})

router.delete('/notes/:id', (req, res) => {
    NotesFormController.destroy(req, res)
})

router.get('/create-note', (req, res) => {
    NotesFormController.showCreateForm(req, res)
})

router.post('/create-note', (req, res) => {
    NotesFormController.create(req, res)
})

router.get('/delete-all', (req, res) => {
    NotesFormController.destroyAll(req, res)
})