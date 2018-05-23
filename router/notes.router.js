'use strict';

const express = require('express');
const router = express.Router();
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);

router.get('/notes', (req, res, next) => {
    const { searchTerm } = req.query;
  
    notes.filter(searchTerm, (err, list) => {
        if (err) {
            return next(err); // goes to error handler
        }
        if(req.query.searchTerm) {
            let search = req.query.searchTerm.toLowerCase();
            res.json(data.filter(item => item.title.toLowerCase().includes(search)||item.content.toLowerCase().includes(search))); 
        }
        res.json(list);    
    });
});

router.get('/notes/:id', (req , res) => {
    const id = req.params.id;

    notes.find(id, (err, item) => {
        if(err) {
            return next(err);
        }
        res.json(item);
        //data.find(item => item.id === Number(req.params.id))
    });
});

router.put('/notes/:id', (req, res, next) => {
    const id = req.params.id;
  
    /***** Never trust users - validate input *****/
    const updateObj = {};
    const updateFields = ['title', 'content'];
  
    updateFields.forEach(field => {
        if (field in req.body) {
            updateObj[field] = req.body[field];
        }
    });
  
    notes.update(id, updateObj, (err, item) => {
        if (err) {
            return next(err);
        }
        if (item) {
            res.json(item);
        } else {
            next();
        }
    });
});

router.post('/notes', (req, res, next) =>{
    const { title, content } = req.body;

    const newItem = { title, content };
    /***** Never trust users - validate input *****/
    if (!newItem.title) {
        const err = new Error('Missing `title` in request body');
        err.status = 400;
        return next(err);
    }

    notes.create(newItem, (err, item) => {
        if (err) {
            return next(err);
        }
        if (item) {
            res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
        } else {
            next();
        }
    });
});

router.delete('/notes/:id', (req, res, next) => {
    const id = req.params.id;
    notes.delete(id, (err, item) => {
        if (err) {
            return next(err);
        }
        if (item) {
            res.json(item);
        }
    });
});


module.exports = router;