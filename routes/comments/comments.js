const express = require("express");
const {
  createCommentCntrl,
  showCommentCntrl,
  deleteCommentCntrl,
  updateCommentCntrl,
} = require("../../controllers/comments/comments");
const protected = require("../../middlewares/protected");
const commentRoutes = express.Router();
// create comment
commentRoutes.post("/:id", protected, createCommentCntrl);

// delete Comment
commentRoutes.delete("/:id", protected, deleteCommentCntrl);

// get particular comment
commentRoutes.get("/:id", showCommentCntrl);

// update Comment
commentRoutes.put("/:id", protected, updateCommentCntrl);

module.exports = commentRoutes;
