const Comment = require("../../models/comment/Comment");
const Post = require("../../models/post/Post");
const User = require("../../models/user/User");
const appErr = require("../../utils/appErr");

// create comment controller

const createCommentCntrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    const comment = await Comment.create({
      user: req.session.userAuth,
      message,
      post: post.id,
    });
    // save the comment inside user and post
    post.comments.push(comment._id);
    const user = await User.findById(req.session.userAuth);
    user.comments.push(comment._id);
    //disable validate and then save
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });
    // res.json({
    //   status: "success",
    //   post: post.comments,
    //   user: user.comments,
    // });
    res.redirect(`/api/v1/posts/${post._id}`);
  } catch (err) {
    res.json(err);
  }
};

// get particular comment controller
const showCommentCntrl = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      // return next(appErr("Please Select comment"));
      return res.render("comment/updateComment", {
        comment: "",
        err: "Invalid comment",
      });
    }
    // res.json({
    //   status: "success",
    //   post: "Comment Specific",
    //   comment: comment,
    // });
    res.render("comment/updateComment", { comment, err: "" });
  } catch (err) {
    // res.json(err);
    res.render("comment/updateComment", { comment: "", err: err.message });
  }
};

// deleteComment Controller
const deleteCommentCntrl = async (req, res, next) => {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId);
    if (!comment) {
      // return next(appErr("Please Select the comment", 403));
      return res.render("post/postDetails", {
        post: "",
        err: "Please Select the comment",
      });
    }
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      // return next(appErr("Cannot Delete this comment"), 403);
      return res.render("post/postDetails", {
        post: "",
        err: "Cannot Delete this comment",
      });
    }

    await Comment.findByIdAndDelete(commentId);
    // delete from the user and post
    const user = await User.findByIdAndUpdate(
      req.session.userAuth,
      { $pull: { comments: commentId } },
      { new: true }
    );

    const post = await Post.findByIdAndUpdate(
      comment.post,
      { $pull: { comments: commentId } },
      { new: true }
    );
    // res.json({
    //   status: "success",
    //   message: "Comment Deleted",
    //   post: post,
    //   user: user,
    // });
    res.redirect(`/api/v1/posts/${comment.post}`);
  } catch (err) {
    res.json(err);
  }
};

//   update Comment Controller
const updateCommentCntrl = async (req, res, next) => {
  const { message } = req.body;
  if (!message) {
    // return next(appErr("Enter The comment", 403));
    return res.render("comment/updateComment", {
      comment: "",
      err: "Enter The comment",
    });
  }
  try {
    const commentId = req.params.id;
    const comment = await Comment.findById(commentId).populate("post");
    await Comment.findByIdAndUpdate(commentId, { message }, { new: true });

    // res.json({
    //   status: "success",
    //   post: "Comment updated",
    //   comment: comment,
    // });
    res.redirect(`/api/v1/posts/${comment.post}`);
  } catch (err) {
    res.json(err);
  }
};

module.exports = {
  updateCommentCntrl,
  createCommentCntrl,
  deleteCommentCntrl,
  showCommentCntrl,
};
