const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
// const {User} = require('./users/models');
const {router: usersRouter} = require('./users');

app.use(morgan('common'));
app.use(express.static('public'));

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');

// app.listen(process.env.PORT || 8080);

const fetchAPI_URL= 'http://finance.google.com/finance/info?client=ig&q='

app.use('/users/', usersRouter);

// app.use('*', function(req, res) {
//   return res.status(404).json({message: 'Not Found'});
// });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/stocktrax', (req, res) => {
    res.sendFile(__dirname + '/public/stocktrax.html');
});

// referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer() {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
