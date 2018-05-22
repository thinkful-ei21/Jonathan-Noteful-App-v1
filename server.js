'use strict';

// INSERT EXPRESS APP CODE HERE...
const express = require('express');
const data = require('./db/notes');
const {PORT} = require('./config');
const {logger} = require('./middleware/logger')
const app = express();

// ADD STATIC SERVER HERE
app.use(logger);
app.use(express.static('public'));



app.get('/api/notes', (req , res) => {
    if(req.query.searchTerm) {
        let search = req.query.searchTerm.toLowerCase();
        res.json(data.filter(item => item.title.toLowerCase().includes(search)||item.content.toLowerCase().includes(search))); 
    }
    res.json(data);
});

app.get('/api/notes/:id', (req , res) => {
    res.json(data.find(item => item.id === Number(req.params.id)));
});


app.listen(PORT, function() {
    console.info(`server listening on ${this.address().port}`);
}).on('error', err => {
    console.error(err);
});