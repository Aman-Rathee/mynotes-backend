const express = require('express')
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');



// ROUTE 1: Fetch all notes using: Get "/api/notes/fetchallnotes" . Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured")
    }
})

// ROUTE 2: Add a new note using: Post "/api/notes/addnote" . Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atlist five characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        // If there are errors, return Bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title, description, tags, user: req.user.id
        })
        const savenote = await note.save()

        res.json(savenote)

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured")
    }

})




// ROUTE 3: Update an existing note using: Put "/api/notes/updatenote" . Login required
router.put('/updatenote/:id', fetchuser, [
    // body('title', 'Enter a valid title').isLength({ min: 3 }),
    // body('description', 'Description must be atlist five characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tags) { newNote.tags = tags };

        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") }

        // Allow updation only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured")
    }

})



// ROUTE 4: Delete an existing note using: Delete "/api/notes/deletenote" . Login required
router.delete('/deletenote/:id', fetchuser, [
    // body('title', 'Enter a valid title').isLength({ min: 3 }),
    // body('description', 'Description must be atlist five characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        // Find the note to be delete and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not found") }

        // Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "success": "Note has been deleted", note: note })

    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error occured")
    }

})



module.exports = router