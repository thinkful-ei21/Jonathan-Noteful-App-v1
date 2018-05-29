'use strict';
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });
  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });
});

// describe('Noteful App', function () {

//     let server;
//     before(function () {
//       return app.startServer()
//         .then(instance => server = instance);
//     });
  
//     after(function () {
//       return server.stopServer();
//     });
// });

describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });

});
  
describe('404 handler', function () {

  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

});

describe('GET /api/notes', function() {
    
  it('should return list of 10', function() {
    return chai.request(app)
      .get('/api/notes')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(10);
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.have.all.keys('id', 'title', 'content');
        });
      });
  });

  it('should return list of 2 notes with the searchTerm "the"', function() {
    return chai.request(app)
      .get('/api/notes?searchTerm=the')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(2);
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.have.all.keys('id', 'title', 'content');
        });
      });
  });

  it('should error an incorrect query', function() {
    return chai.request(app)
      .get('/api/notes?searchTerm=FALSE')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(0);
      });
  });

});

describe('GET /api/notes/:id', function () {

  it('should return correct notes', function () {
    return chai.request(app)
      .get('/api/notes/1003')
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1003);
        expect(res.body.title).to.equal('7 things lady gaga has in common with cats');
      });
  });

  it('should respond with a 404 for an invalid id', function () {
    return chai.request(app)
      .get('/api/notes/FALSE')
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

});

describe('POST /api/notes', function () {

  it('should create and return a new item', function () {
    const newItem = {
      'title': 'Jonathan',
      'content': 'Riggs'
    };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(function (res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res).to.have.header('location');
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1010);
        expect(res.body.title).to.equal(newItem.title);
        expect(res.body.content).to.equal(newItem.content);
      });
  });

  it('should return an error due to missing "title" field', function () {
    const newItem = {
      'TEST': 'ERROR'
    };
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });

});

describe('PUT /api/notes/:id', function () {

  it('should update a note', function () {
    const updateItem = {
      'title': 'Jonathan',
      'content': 'Riggs'
    };
    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');
        expect(res.body.id).to.equal(1005);
        expect(res.body.title).to.equal(updateItem.title);
        expect(res.body.content).to.equal(updateItem.content);
      });
  });

  it('should have a 404 due to an invalid id', function () {
    const updateItem = {
      'title': 'Jonathan',
      'content': 'Riggs'
    };
    return chai.request(app)
      .put('/api/notes/FALSE')
      .send(updateItem)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });

  it('should return an error due to missing "title" and "content" field', function () {
    const updateItem = {
      'TEST': 'ERROR'
    };
    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title, content` in request body');
      });
  });

  it('should return an error due to missing "content" field', function () {
    const updateItem = {
      'title': 'Jonathan'
    };
    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `content` in request body');
      });
  });

});

describe('DELETE  /api/notes/:id', function () {

  it('should delete an item by id', function () {
    return chai.request(app)
      .delete('/api/notes/1005')
      .then(function (res) {
        expect(res).to.have.status(204);
      });
  });

});