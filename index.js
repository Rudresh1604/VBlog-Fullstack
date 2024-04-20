require("dotenv").config();
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const userRoutes = require("./routes/users/users");
const postRoutes = require("./routes/posts/posts");
const commentRoutes = require("./routes/comments/comments");
const globalHandler = require("./middlewares/globalHandler");
const Post = require("./models/post/Post");
const { truncatePost } = require("./utils/helper");
const app = express();

require("./config/dbConnect");

//to use truncate function from utils we add that
// function in local of the machine
app.locals.truncatePost = truncatePost;

// middlewares
app.use(express.json()); //pass incoming json data
app.use(express.urlencoded({ extended: true }));

// configure ejs
app.set("view engine", "ejs");
//serve the static folder
app.use(express.static(__dirname + "/public"));

// method override
app.use(methodOverride("_method"));
// session
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60, //1 day
    }),
  })
);
//* ========== Save The User into Local
app.use((req, res, next) => {
  if (req.session.userAuth) {
    res.locals.userAuth = req.session.userAuth;
  } else {
    res.locals.userAuth = null;
  }
  next();
});
// * ======== Home Routes
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.render("index", { posts });
  } catch (error) {
    res.render("index", { err: error.message });
  }
});
// * ======== User Routes ========
app.use("/api/v1/users", userRoutes);
// * ============ Post Route ========
app.use("/api/v1/posts", postRoutes);
// * ============= Comment Routes ==========
app.use("/api/v1/comments", commentRoutes);

// Error handler middlewares
app.use(globalHandler);
// listen server

const PORT = process.env.PORT | 3000;
app.listen(PORT, console.log(`Server is running on port ${PORT} ...`));
