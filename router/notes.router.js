'use strict';

const express = require('express');
const router = express.Router();
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);

router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
    
  notes.filter(searchTerm)
    .then(list => {
      if(searchTerm) {
        let search = searchTerm.toLowerCase();
        res.json(list.filter(item => item.title.toLowerCase().includes(search)||item.content.toLowerCase().includes(search)));
      }
      else {
        res.json(list);
      }
    })
    .catch(err => {
      next(err);
    });
});

router.get('/:id', (req , res, next) => {
  const id = req.params.id;

  notes.find(id)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      next(err);
    });
});

router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  
  const updateObj = {};
  const updateFields = ['title', 'content'];
  const missingFields =[];
  
  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    } else {
      missingFields.push(field);
    }
  });
  if (missingFields.length > 0) {
    return res.status(400).json({message: `Missing \`${missingFields.join(', ')}\` in request body`});
  }
  notes.update(id, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      next(err);
    });
});

router.post('/', (req, res, next) =>{
  const { title, content } = req.body;

  const newItem = { title, content };
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  notes.create(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      }
    })
    .catch(err => {
      next(err);
    });
});

router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  notes.delete(id)
    .then(item => {
      if (item) {
        res.sendStatus(204);
      }
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;