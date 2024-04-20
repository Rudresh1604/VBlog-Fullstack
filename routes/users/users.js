const express = require("express");
const multer = require("multer");
const {
  loginCntrl,
  registerCntrl,
  profilePublicCntrl,
  profileCntrl,
  userPasswordCtrl,
  profilePhotoCntrl,
  userDetailsCtrl,
  coverPhotoCntrl,
  passwordUpdateCntrl,
  updateUserCntrl,
  logoutCntrl,
} = require("../../controllers/users/users");
const protected = require("../../middlewares/protected");
const storage = require("../../config/cloudinary");
const userRoutes = express.Router();

// instance of multer
const upload = multer({ storage });

// ! Rendering Routes
// register route
userRoutes.get("/register", (req, res) => {
  res.render("user/register", { err: "" });
});
// login route
userRoutes.get("/login", (req, res) => {
  res.render("user/login", { err: "" });
});
// // profile route
// userRoutes.get("/profile-page", (req, res) => {
//   res.render("user/profile");
// });
// cover photo route
userRoutes.get("/upload-cover-photo-form", (req, res) => {
  res.render("user/uploadCoverPhoto", { err: "" });
});
// profile photo upload route
userRoutes.get("/upload-profile-photo-form", (req, res) => {
  res.render("user/uploadProfilePhoto", { err: "" });
});
// update user route
// userRoutes.get("/update-user/:id", (req, res) => {
//   res.render("user/update", { userId: req.params.id });
// });
// ! Post Route
// login route
userRoutes.post("/login", loginCntrl);

// register route
userRoutes.post("/register", registerCntrl);

// profile route
userRoutes.get("/profile-page", protected, profileCntrl);

// profile photo upload route
userRoutes.put(
  "/profile-photo-upload",
  protected,
  upload.single("profile"),
  profilePhotoCntrl
);

// cover photo upload
userRoutes.put(
  "/cover-photo-upload",
  protected,
  upload.single("coverImage"),
  coverPhotoCntrl
);
userRoutes.get("/update-user-password", userPasswordCtrl);

// user password update
userRoutes.put("/update-password", passwordUpdateCntrl);

// profile route (for public)
userRoutes.get("/profile/:id", profilePublicCntrl);

// update user
userRoutes.put("/update-user", updateUserCntrl);

// logout route
userRoutes.get("/logout", logoutCntrl);

userRoutes.get("/update-user/:id", userDetailsCtrl);

module.exports = userRoutes;
