const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const {Incident} = require('./models/incidents');
var fs  = require('fs')
var Jimp = require('jimp');

const app = express();
const port = process.env.PORT || 8000;

//multer options - to upload file into buffer
const uploadBuffer = multer({
	// remove the dest folder as we are using buffer
	//dest: 'images',
	// put 1MB as the filesize limit
	limit: {
		fileSize: 1000000,
	},
	// validate the file type as PNG, JPG or JPEG
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(png|jpg|jpeg)$/)){
			// throw error if file type is not image
			cb(new Error('Please upload an image.'));
		}
		// throw undefined error
		cb(undefined, true);
	}
});

// a POST image to folder endpoint - for testing only
// remember to uncomment line 11 to activate the destination folder if needed
// app.post('/upload', uploadBuffer.single('image'), (req, res) => {
// 	res.send();
// }, (error, req, res, next) => {
// 	// handle cb that being thrown here
// 	res.status(400).send({error: error.message});
// });

// a POST endpoint to upload image onto instance buffer
app.post('/uploadImage', uploadBuffer.single('image'), async (req, res) => {
		try {
			// associate the buffer file with ID from request body
			var incident = await Incident.findById(req.body.id);
			// to resize each frame to 100 X 75
			const buffer = await sharp(req.file.buffer).resize({ width: 100, height: 75}).png().toBuffer()
			// for debugging
			// console.log("Incident:", incident);
			// console.log("this is the request id: ", req.body.id);
			// console.log("this is the request buffer: ", req.file.buffer);					
			if(!incident)
				incident = new Incident();
			incident.image = buffer;			
			// save it as image property on our instance
			incident.save(function(err, incident) {
        		if (err) return res.json(err);
        		res.send('Image ' + incident._id + ' successfully created!');
    		});			
		} catch (e){
			res.status(400).send({e: e.message});
		}
	}, (error, req, res, next) => {
	res.status(400).send({error: error.message});
});

// a DELETE endpoint to delete the image buffer
app.delete('/uploadImage', async (req, res) => {
	try {
		// for debugging
		// console.log("this is the request id: ", req.query.id);
		var incident = await Incident.findById(req.query.id);
		// for debugging
		// console.log(`Incident: ${incident}`);
		// to set the image property undefine for deletion
		incident.image = undefined;
		incident.save();
		res.send();
	} catch (e) {
		res.status(400).send({e: e.message});
	}
});

// a GET endpoint to retrieve the image buffer
app.get('/:id/image', async (req, res) => {
	try {
		// for debugging
		// console.log("this is the params id: ", req.params.id);		
		const incident = await Incident.findById(req.params.id)
		if (!incident || !incident.image) {
			throw new Error()
		}
		// for debugging
		// console.log("Incident:", incident);
		//response header, use set - PNG
		res.set('Content-Type', 'image/png');
		res.send(incident.image);
	} catch(e) {
		res.status(404).send();
	}
});

// a POST endpoint to upload image(s) onto instance buffer
var uploadFiles = uploadBuffer.array('images', 100);

const resizeImages = async (req, res, next) => {
  if (!req.files) return next();
  // req.body.images = [];
  await Promise.all(
    req.files.map(async file => {
      // const newFilename = ...;
      await sharp(file.buffer).resize({ width: 100, height: 75}).png().toBuffer()
      // req.body.images.push(newFilename);
    })
  );
  next();
};

// a POST endpoint to upload image onto instance buffer
app.post('/uploadImages', uploadFiles, resizeImages, async (req, res) => {
		try {
			// associate the buffer file with ID from request body
			var incident = await Incident.findById(req.body.id);
			var jimps = [];

			// create a new background image according to the # of images	
			// console.log("this is the # of images: ", req.files.length);
			var background = [];
			var bg = new Jimp(100, 75 * req.files.length, '#000000ff', (err, image) => {				
			});		
			background.push(bg);
			var uploadTS = Date.now();
			background[0].write('images/temp/' + uploadTS + '_background' +'.png', function() {
		    	console.log("save the background image under images/temp folder...");
		    	jimps.push(Jimp.read('images/temp/' + uploadTS + '_background' +'.png'));
			});	
			
			// resize each frame to 100 X 75
			for(i=0; i<req.files.length; i++)
			{
				var resizedImg = await sharp(req.files[i].buffer).resize({ width: 100, height: 75}).png().toBuffer();
				fs.writeFileSync('images/temp/' + uploadTS + '_' + (i+1) +'.png', resizedImg);				
				jimps.push(Jimp.read('images/temp/' + uploadTS + '_' + (i+1) +'.png'));			
			}
			
			// concate them in an image
			Promise.all(jimps).then(function(data) {
			  return Promise.all(jimps);
			}).then(function(data) {

				// console.log("this is the data.length: ", data.length);	
				for(j=1; j<data.length; j++)
				{									
					data[0].composite(data[1], 0, (j-1)*75);
				}			  			  
			  	data[0].write('images/result/' + uploadTS + '.png', function() {
			  		
			    	console.log("save the result image under images/result folder...");
			    	// console.log("this is the request id: ", req.body.id);
			    	if(!incident)
						incident = new Incident();

					// convert from image to buffer
					Jimp.read('images/result/' + uploadTS + '.png').then(image => {
						image.getBuffer(Jimp.MIME_PNG, async (err, buffer) => {
							console.log(buffer);
							const result = await sharp(buffer).png().toBuffer()
							incident.image = result;

							// save it as image property on our instance
							incident.save(function(err, incident) {
				        		if (err) return res.json(err);
				        		res.send('Image ' + incident._id + ' successfully created!');
				    		});
						})
					});
			  	});			  	
			});		
		} catch (e){
			res.status(400).send({e: e.message});
		}
	}, (error, req, res, next) => {
	res.status(400).send({error: error.message});
});

// running the server
app.listen(port, function() {
    console.log(`App running successfully on port number ${port}...`);
});