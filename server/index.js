const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;
var frames;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true },
  function(err, database) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = database.db('frames'); //database;
    frames = db.collection('frames');

    console.log('Database connection ready');

    // Initialize the app.
    var server = app.listen(process.env.PORT || 8080, function() {
      var port = server.address().port;
      console.log('App now running on port', port);
    });
  }
);

// CONTACTS API ROUTES BELOW
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log('ERROR: ' + reason);
  res.status(code || 500).json({ error: message });
}

/**
 * keys is a list of key:value
 * select keys in Frames and project on field
 * returns a list of unique values
 * example: findField({ brand:'Time' }, 'model')
 * returns a list of 'model' (each model appears only once) for the brand 'Time'
 */
const findField = function(keys, field, res) {
  frames
    .find(keys)
    .map(function(entry) {
      return entry[field];
    })
    .toArray(function(err, docs) {
      if (err) {
        handleError(res, err.message, 'Failed to get ' + field + '.');
      } else {
        res.status(200).json(docs);
      }
    });
};

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

/*  "/all"
 *    GET: finds all frames
 */
app.get('/all', function(req, res) {
  frames
    .find({})
    // .map(({ _id, brand, model, size, year }) => ({
    //   _id: _id,
    //   brand: brand,
    //   model: model,
    //   size: size,
    //   year: year
    // }))
    .toArray(function(err, docs) {
      if (err) {
        handleError(res, err.message, 'Failed to get frames.');
      } else {
        // console.log(docs);
        res.status(200).json(docs);
      }
    });
});

app.get('/brands', function(req, res) {
  findField({}, 'brand', res);
});

// app.get("/models", function(req, res) {
//     findField({brand:req.param('brand')}, 'model', res);
// });
app.get('/models/:brand', function(req, res) {
  let brand = req.params.brand;
  findField({ brand: brand }, 'model', res);
});
app.get('/sizes', function(req, res) {
  findField(
    { brand: req.param('brand'), model: req.param('model') },
    'size',
    res
  );
});

app.get('/years', function(req, res) {
  findField(
    {
      brand: req.param('brand'),
      model: req.param('model'),
      size: req.param('size'),
    },
    'year',
    res
  );
});
