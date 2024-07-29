// Basic Set Up
// Project (Phase c) - Part a
//Cloud Setup
if(process.env.NODE_ENV != "production") {
  require('dotenv').config();
   
}
// console.log(process.env.SECRET);



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
// const {listingSchema , reviewSchema} = require("./Schema.js");
// const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const multer = require('multer');
const upload = multer({dest : 'uploads/'})


const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// const postsRouter = require("./classroom/Routes/post.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

//Basic set Up
main()
  .then(() => {
    console.log("connected to DB")
  })
  .catch((err) => {
    console.log(err);
  })

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
// app.use("/posts", postsRouter);
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname , "/public")));
// app.use(upload.single('listing[image][url]'));

//Project - Phase 3 (Part d)
//Mongo Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl ,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24*3600,
});

store.on("error" , () => {
  console.log("Error in Mongo Session Store" , err);
})


//Impplement Sessions In Project
// Cookie in Session Option
const sessionOptions = {
  store ,  
  secret: process.env.SECRET,
  resave: false,
  saveUnitialized: true,
  cookie: {
     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
     maxAge: 7 * 24 * 60 * 60 * 1000,
     httOnly : true,
  }
}


// Basic Set Up
// app.get("/" ,(req,res) => {
//   res.send("Hi , i am root");
// })


app.use(session(sessionOptions));
app.use(flash());

// Project- Phase 2 (Part d)
//Configuring Strategy
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req , res , next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  // console.log(res.locals.success);
  next();
})

//Listng Model
// app.get("/testListing" , async (req,res) => {
//      let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By The Beach",
//         price : 1200,
//         location: "Calungate , India",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("Sample was Saved");
//     res.send("Succcessful testing");
// });

// Project- Phase 2 (Part d)
// Demo User
app.get((req , res , next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
})

// app.get("/demouser" , async(req , res) => {
//   let fakeUser = new User({
//     email: "student1@gmail.com",
//     username: "delta-student1",
//   })

//   let registeredUser = await User.register(fakeUser , "helloworld");
//   res.send(registeredUser);
// })

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);


// //Custom Error Handling
// app.use((err , req , res, next) => {
//   res.send("Something Went Wrong!");
// })

// Add Express Error
app.all("*"  , (req , res , next) => {
  next(new ExpressError(404, "Page Not Found"));
})

// Add Express Error
app.use((err , req , res , next) => {
  let {statusCode=500 , message="Something Went Wrong"} = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs" , {message});
})

app.listen(8080 , () => {
    console.log("server is listening on port 8080")
})
