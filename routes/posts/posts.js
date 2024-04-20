const express = require("express");
const multer = require("multer");
const {
  createPostCntrl,
  showPostCntrl,
  showParticularPostCntrl,
  deletePostCntrl,
  updatePostCntrl,
} = require("../../controllers/posts/posts");
const protected = require("../../middlewares/protected");
const storage = require("../../config/cloudinary");
const Post = require("../../models/post/Post");
const postRoutes = express.Router();

//create instance of multer
const upload = multer({ storage });

// create post get
postRoutes.get("/create-post", protected, (req, res) => {
  try {
    res.render("post/addPost", { err: "" });
  } catch (error) {
    res.render("post/addPost", { err: error.message });
  }
});
// update post
postRoutes.get("/update-post/:id", protected, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render("post/updatePost", { err: "", post });
  } catch (err) {
    res.render("post/updatePost", { err: err.message, post: "" });
  }
});
// create post
postRoutes.post(
  "/create-post",
  protected,
  upload.single("image"),
  createPostCntrl
);
// show post
postRoutes.get("/", showPostCntrl);
// get particular post
postRoutes.get("/:id", protected, showParticularPostCntrl);
// delete post
postRoutes.delete("/:id", protected, deletePostCntrl);

// update post
postRoutes.put(
  "/update-post/:id",
  protected,
  upload.single("image"),
  updatePostCntrl
);

module.exports = postRoutes;
