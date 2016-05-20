var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var URLs = mongoose.model('URL');
var isValid = require('url-valid');


router.get('/', function(req, res) {
  res.render('index', { title: 'The Url Shortener' });
});

router.get('/:id', function(req, res, next) {

  	var urlId =   parseInt(req.params.id, 10);
  	var query = { _id : urlId};
  	URLs.findById(query, function(err, url){
      	if (err) {
          	console.log("error finding url " + err);
          	res.send({'error' : "error finding givens url " + err});
      	} 
      	else {
          	if (url) { 
             	res.redirect(url.original_url);
          	} 
          	else {
             	res.send({'error' : "error in url with id of " + urlId});
          	}
      	} 
  	});
});

router.get('/short/:url(*)', function(req, res, next) {

    	var baseUrl = process.env.BASEURL || "https://urltiny.herokuapp.com/";
    	console.log(baseUrl);
    	var original_url = req.params.url;
    	var query = { original_url : original_url };
    
    	isValid(original_url, function (err, valid) {
      		if (err){
        		console.log('error trying to validate the url : ' + err);
      		}
      		else {  
        		if (valid){
            		URLs.findOne(query, function(err, url){
                		if (err) {
                    		res.send({"Message": 'Cannot find URL on database ' + err});
                		}	 
                		else {
                    		if (url) {
                       			res.send({"Hey":" this url has been shortened before" ,"original_url": original_url, "short_url" : baseUrl + url._id}); 
                    		}
                    		else {
                        	// Step 4: create new url document and save it to the db
                        		var newUrl = new URLs();
                        		newUrl.original_url = original_url;
                        
                        		newUrl.save(function(err, url){
                            		if (err) {
                                		console.log("error saving url");
                            		} 
                            		else {
                               		// send response to the client
                               			res.send({"original_url": url.original_url, "short_url" : baseUrl + url._id});  
                            		}
                        		});
                    		}
                		}
            		});
        		// send error message that it was not a valid url  
        		}
        		else {
            		res.send({"Not a Valid URL": original_url});
        		}
      		}
    	});
});


module.exports = router;
