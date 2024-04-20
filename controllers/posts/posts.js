const Post = require("../../models/post/Post");
const User = require("../../models/user/User");
const appErr = require("../../utils/appErr");
// create post controller
const createPostCntrl = async (req, res, next) => {
  const { title, description, category } = req.body;

  try {
    if (!title || !description || !category) {
      // return next(appErr("Please Enter All fields"));
      return res.render("post/addPost", { err: "Please Enter All Fields" });
    }

    // get user id
    const userId = req.session.userAuth;
    // find the user
    const userFound = await User.findById(userId);
    // create post
    let post;
    if (req.file) {
      post = await Post.create({
        title,
        description,
        category,
        user: userFound.id,
        image: req.file.path,
      });
    } else {
      post = await Post.create({
        title,
        description,
        category,
        user: userFound.id,
      });
    }

    userFound.post.push(post._id);
    // save the user
    await userFound.save();

    res.redirect("/");
  } catch (err) {
    res.render("post/addPost", { err: err.message });
  }
};

//   update Post controller
const updatePostCntrl = async (req, res, next) => {
  const { description, title, category } = req.body;
  if (!description || !title || !category) {
    // return next(appErr("Please Enter Proper details"));
    return res.render("post/updatePost", {
      err: "Please Enter Proper Details",
      post: "",
    });
  }
  try {
    const postId = req.params.id;
    // if (!postId) {
    //   // return next(appErr("Please Select the Post"));
    // }
    let post = await Post.findById(postId);
    if (!post) {
      // return next(appErr("Invalid Post"));
      return res.render("post/updatePost", { err: "Invalid Post", post: "" });
    }
    // cheack if user is updating the image or not
    if (req.file) {
      await Post.findByIdAndUpdate(
        postId,
        {
          description,
          title,
          category,
          image: req.file.path,
        },
        { new: true }
      );
    } else {
      await Post.findByIdAndUpdate(
        postId,
        {
          description,
          title,
          category,
        },
        { new: true }
      );
    }
    // res.json({
    //   status: "success",
    //   post: "Post updated",
    //   data: post,
    // });
    res.redirect("/api/v1/posts/" + postId);
  } catch (err) {
    res.json(err);
  }
};

// delete post controller
const deletePostCntrl = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      // return next(appErr("Invalid Post"));
      return res.render("post/postDetails", { post: "", err: "Invalid Post" });
    }
    if (post.user.toString() !== req.session.userAuth.toString()) {
      // return next(appErr("You are not allowed to delete this post", 403));
      return res.render("post/postDetails", {
        post: "",
        err: "You are not allowed to delete this post",
      });
    }
    await Post.findByIdAndDelete(postId);
    // to delete the post id from user post
    const user = await User.findByIdAndUpdate(
      req.session.userAuth.toString(),
      { $pull: { post: postId } },
      { new: true }
    );

    // res.json({
    //   status: "success",
    //   post: "Post Deleted",
    //   data: user,
    // });

    res.redirect("/");
  } catch (err) {
    // res.json(err);
    res.render("post/postDetails", { post: "", err: err.message });
  }
};

//   show post controller
const showPostCntrl = async (req, res, next) => {
  try {
    const post = await Post.find().populate("comments").populate("user");
    res.json({
      status: "success",
      post: post,
    });
  } catch (err) {
    res.json(err);
  }
};

//   showParticular Post controller
const showParticularPostCntrl = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate("user");
    if (!post) {
      // return next(appErr("Cannot get Post"));
      return res.render("post/postDetails", {
        post: "",
        err: "Cannot get Post",
      });
    }
    res.render("post/postDetails", { post, err: "" });
    // res.json({
    //   status: "success",
    //   post: post,
    // });
  } catch (err) {
    // next(app(err.message));
    return res.render("post/postDetails", { post: "", err });
  }
};

module.exports = {
  showParticularPostCntrl,
  showPostCntrl,
  createPostCntrl,
  updatePostCntrl,
  deletePostCntrl,
};
