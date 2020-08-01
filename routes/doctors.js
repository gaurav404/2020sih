var express = require("express");
var router  = express.Router();
var Doctor = require("../models/doctor");
var middleware = require("../middleware");


//INDEX - show all doctors


router.get("/", function(req, res){
    res.render("doctors");
});


router.get("/sdoc", function(req, res){

 // Doctor.find({}, function(err, allDoctors){


 //      console.log(" show all of the docs");
 //       if(err){
 //           console.log(err);
 //       } else {
 //          res.render("doctors/index",{doctors:allDoctors,noMatch :nomatch});
 //       }
 //    });
  console.log(" here we are at doc");
    var nomatch = null;
    // Get all doctors from DB
    //var city = req.body.tagName;
    //console.log(city);
    var searchby = req.query.searchby;
     console.log( req.query.searchby);
    if(searchby == "doctors"){
      if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
         Doctor.find({name:regex}, function(err, allDoctors){
         if(err){
           console.log(err);
         } else {
           
           if(allDoctors.length <1){
               nomatch = " no match yo ";
           }
          res.render("doctors/index",{doctors:allDoctors,noMatch :nomatch});
         }
       });
        
      }
    
    else {
            Doctor.find({}, function(err, allDoctors){
               if(err){
                   console.log(err);
               } else {
             res.render("doctors/index",{doctors:allDoctors,noMatch :nomatch});
           }
        });
        }
    
    }
    
    // location ke basis pe search karenge yaha 
    
    else if(searchby == "location") {
        
          if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
         Doctor.find({location:regex}, function(err, allDoctors){
       if(err){
           console.log(err);
       } else {
           
           if(allDoctors.length <1){
               nomatch = " no match yo ";
           }
          res.render("doctors/index",{doctors:allDoctors,noMatch :nomatch});
       }
    });
        
    }
    
    else {
    Doctor.find({}, function(err, allDoctors){
       if(err){
           console.log(err);
       } else {
          res.render("doctors/index",{doctors:allDoctors,noMatch :nomatch});
       }
    });
    }
    }
    
    
     else if(searchby == "specialization") {
        
          if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
         Doctor.find({specialization:regex}, function(err, allDoctors){
       if(err){
           console.log(err);
       } else {
           
           if(allDoctors.length <1){
               nomatch = " no match yo ";
           }
          res.render("doctors/index",{doctors:allDoctors,noMatch :nomatch});
       }
    });
        
    }
    
    else {


      console.log(" here we are at doc 2");
    Doctor.find({}, function(err, allDoctors){


      console.log(" show all of the docs");
       if(err){
           console.log(err);
       } else {
          res.render("doctors/index",{doctors:allDoctors,noMatch :nomatch});
       }
    });
    }
    }
    
    
    
});


// <!------------------------------




















//CREATE - add new doctor to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to doctors array
    var rating = req.body.star;
    var name = req.body.name;
    var image = req.body.image;
    var specialization = req.body.specialization;
    var location = req.body.location;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newDoctor = {name: name, image: image,rating:rating, description: desc, author:author,specialization:specialization,location:location}
    // Create a new doctor and save to DB
    Doctor.create(newDoctor, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to doctors page
            console.log(newlyCreated);
            res.redirect("/doctors?search=&searchby=doctors");
        }
    });
});

//NEW - show form to create new doctor
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("doctors/new"); 
});

// SHOW - shows more info about one doctor
router.get("/:id", function(req, res){
    //find the doctor with provided ID
    Doctor.findById(req.params.id).populate("comments").exec(function(err, foundDoctor){
        if(err){
            console.log(err);
        } else {
            console.log(foundDoctor)
            //render show template with that doctor
            res.render("doctors/show", {doctor: foundDoctor});
        }
    });
});

// EDIT DOCTOR ROUTE
router.get("/:id/edit", middleware.checkDoctorOwnership, function(req, res){
    Doctor.findById(req.params.id, function(err, foundDoctor){
        if(err){
          res.redirect("/doctors");  
        }else {
                res.render("doctors/edit", {doctor: foundDoctor});
        }
    });
});

// UPDATE DOCTOR ROUTE
router.put("/:id",middleware.checkDoctorOwnership, function(req, res){
    // find and update the correct doctor
    Doctor.findByIdAndUpdate(req.params.id, req.body.doctor, function(err, updatedDoctor){
       if(err){
           res.redirect("/doctors");
       } else {
           //redirect somewhere(show page)
           res.redirect("/doctors/" + req.params.id);
       }
    });
});

// DESTROY DOCTOR ROUTE
router.delete("/:id",middleware.checkDoctorOwnership, function(req, res){
   Doctor.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/doctors");
      } else {
          res.redirect("/doctors");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;

