const express = require('express');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var router = express.Router();
configureExpress();

mongoose.connect('mongodb+srv://admin-ayush:url@10@cluster0-731cd.gcp.mongodb.net/URL', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const urlSchema = new mongoose.Schema({
  uid: String,
  url: String
});
const Url = mongoose.model("Url", urlSchema);
var redirectUrl = "";
var code = "";
var request = require('request-promise');

app.get('/', function(req, res) { //homepage
  let valid = req.query.valid;
  console.log(valid);
  if (typeof req.query.valid === 'undefined') {
    res.render('index', {
      success: false,
      code: req.get('host')+'/'+code
    });
  } else {
    res.render('index', {
      success: valid,
      code: req.get('host')+'/'+code
    });
  }

})

app.get('/about',(req,res)=>{
  res.render('about');
});
app.get('/source',(req,res)=>{
  res.render('source');
});

app.get('/:id', (req, res) => { //open a shortened url

  const id = req.params.id;
  Url.findOne({
    uid: id
  }, function(err, result) {
    if (result != null) {
      redirectUrl = result.url.slice();
      console.log(redirectUrl);
      console.log(typeof redirectUrl);
      res.redirect(redirectUrl);
    } else {
      res.render('not_found');
    }
  });
})

app.post('/home', (req, res) => res.redirect('/')); //redirect from error page to homepage

app.post('/', function(req, res) { //handle url shorten request
  const inputURL = req.body.linkurl;
  console.log('posted url : ' + inputURL);
  code = generateUID();
  const urlObject = new Url({
    uid: code,
    url: req.body.linkurl
  });

  urlObject.save(function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Added new document in database successfully.");
    }
  });
  let string = encodeURIComponent('true');
  res.redirect('/?valid=' + string); //call karu? ha
});

function generateUID() {
  // I generate the UID from two parts here
  // to ensure the random number provide enough bits.
  var firstPart = (Math.random() * 46656) | 0;
  var secondPart = (Math.random() * 46656) | 0;
  firstPart = ("000" + firstPart.toString(36)).slice(-3);
  secondPart = ("000" + secondPart.toString(36)).slice(-3);
  return firstPart + secondPart;
}

function configureExpress() {
  app.use(express.static('public'));
  app.use(express.static(__dirname + '/public'));
  app.set('view engine', 'ejs');
  app.use(bodyParser.json()); // support json encoded bodies
  app.use(bodyParser.urlencoded({
    extended: true
  })); // support encoded bodies
}

app.listen(process.env.PORT || 3000, () => console.log('Server is up and running'));
