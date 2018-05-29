'use strict';

const express = require('express');
const {PORT} = require('./config');
const morgan = require('morgan');
const notesRouter = require('./router/notes.router');
const app = express();

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use('/api/notes', notesRouter);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.status(404).json({ message: 'Not Found' });
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
});

if (require.main === module) {
    app.listen(PORT, function() {
        console.info(`server listening on ${this.address().port}`);
    }).on('error', err => {
        console.error(err);
    });
}

module.exports = app;