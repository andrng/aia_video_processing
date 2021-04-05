//import the mongoose module
const mongoose = require('mongoose');

//set up local mongoose connection
//'mongodb://user:pass@localhost:port/database'
var mongoDB = 'mongodb://admin:123456@127.0.0.1:27017/admin';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Schema = mongoose.Schema;
const IncidentSchema = new Schema({
	image: {type: Buffer},
	// images: {type: [Buffer]}
});

const Incident = new mongoose.model('Incident', IncidentSchema);
module.exports = {Incident}