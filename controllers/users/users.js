const bcrypt = require("bcryptjs");
const User = require("../../models/user/User");
const appErr = require("../../utils/appErr");

// register controller
const registerCntrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  // check if empty details are present or not
  if (!fullname || !email || !password) {
    // return next(appErr("All fields are required"));
    return res.render("user/register", { err: "All fields are required" });
  }
  try {
    // Check if the user exist
    const userFound = await User.findOne({ email });
    if (userFound) {
      // return next(appErr("User Already Registered"));
      return res.render("user/register", { err: "User Already Registered" });
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHashed = await bcrypt.hash(password, salt);
    // register user
    const user = await User.create({
      fullname,
      email,
      password: passwordHashed,
    });
    res.redirect("/api/v1/users/login");
  } catch (err) {
    res.json(err);
  }
};

// login controller
const loginCntrl = async (req, res, next) => {
  const { email, password } = req.body;
  // check if empty details are present or not
  if (!email || !password) {
    return res.render("user/login", { err: "All fields are required" });
  }
  try {
    // check email exist or not
    const userFound = await User.findOne({ email });
    // throw an error
    if (!userFound) {
      // return next(appErr("Please Register first"));
      return res.render("user/login", { err: "Please Register first" });
    } else if (
      userFound &&
      (await bcrypt.compare(password, userFound.password))
    ) {
      req.session.userAuth = userFound._id;
      console.log(req.session);
      return res.redirect("/api/v1/users/profile-page");
    } else {
      // return next(appErr("Invalid Password"));
      return res.render("user/login", { err: "Invalid Password" });
    }
  } catch (err) {
    return res.render("user/login", { err: err.message });
    // res.json(err);
  }
};

// profile for public(user details)
const profilePublicCntrl = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // find the user
    const user = await User.findById(userId).populate("post");
    // res.json({
    //   status: "success",
    //   user: "User Profile",
    //   data: user,
    // });
    res.render("user/profile", { user });
  } catch (err) {
    next(appErr(err.message));
  }
};

// profile for personal
const profileCntrl = async (req, res) => {
  try {
    // get the login user
    const userId = req.session.userAuth;
    // find the user
    const user = await User.findById(userId).populate("post");
    res.render("user/profile", { user });
  } catch (err) {
    res.json(err);
  }
};

// profile photo upload controller
const profilePhotoCntrl = async (req, res, next) => {
  // check file exist or not
  if (!req.file) {
    // return next(appErr("Please Upload Image"));
    return res.render("user/uploadProfilePhoto", {
      err: "Please upload Image",
    });
  }
  console.log(req.file);
  try {
    // get userid
    const userId = req.session.userAuth;
    // 2 . find the user
    const userFound = await User.findById(userId);
    // 3. Not found user then throw error
    if (!userFound) {
      // return next(appErr("Please Login First", 404));
      return res.render("user/uploadProfilePhoto", {
        err: "User Not Found",
      });
    }
    // 4. upload the profile image
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: req.file.path },
      { new: true }
    );
    // res.json({
    //   status: "success",
    //   user: "User Profile photo",
    //   data: updatedUser,
    // });
    res.redirect("/api/v1/users/profile-page");
  } catch (err) {
    res.json(err);
  }
};

// cover photo upload controller
const coverPhotoCntrl = async (req, res, next) => {
  if (!req.file) {
    // return next(appErr("Please Upload Image"));
    return res.render("user/uploadCoverPhoto", {
      err: "Please upload Image",
    });
  }
  console.log(req.file.path);
  try {
    // 1. take user id from session
    const userId = req.session.userAuth;
    // 2. find the user
    const userFound = await User.findById(userId);
    // 3 if no user exist
    if (!userFound) {
      return next(appErr("User Not Found Login Again", 404));
    }
    // 4. update user
    const user = await User.findByIdAndUpdate(userId, {
      coverImage: req.file.path,
    });
    // res.json({
    //   status: "success",
    //   user: "User Cover Photo Upload",
    //   data: updatedUser,
    // });
    res.redirect("/api/v1/users/profile-page");
  } catch (err) {
    res.json(err);
  }
};

//user password update controller
const passwordUpdateCntrl = async (req, res, next) => {
  const { password } = req.body;
  if (!password) {
    return res.render("user/updatePassword", {
      err: "Password can not be empty",
    });
  }
  try {
    const user = await User.findById(req.session.userAuth);
    if (await bcrypt.compare(password, user.password)) {
      return res.render("user/updatePassword", {
        err: "New and Old Password can't be same",
      });
    }

    const salt = 10;
    const passwordHashed = await bcrypt.hash(password, salt);
    // update the password
    await User.findByIdAndUpdate(
      req.session.userAuth,
      {
        password: passwordHashed,
      },
      { new: true }
    );
    res.redirect("/api/v1/users/profile-page");
  } catch (err) {
    return res.render("user/updatePassword", { err: err.message });
  }
};

// logout controller
const logoutCntrl = async (req, res) => {
  // destroy session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};

// update user controller
const updateUserCntrl = async (req, res, next) => {
  const { fullname, email } = req.body;
  if (!email || !fullname) {
    return res.render("user/update", {
      user: "",
      err: "All fields are required",
    });
  }
  try {
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken.fullname === fullname) {
        return res.render("user/update", {
          err: "Name alredy exists",
          user: "",
        });
      }
      const user = await User.findByIdAndUpdate(req.session.userAuth, {
        email,
        fullname,
      });
    }
    // update the user

    // res.json({
    //   status: "success",
    //   user: "User updated",
    //   data: user,
    // });
    res.redirect("/api/v1/users/profile-page");
  } catch (err) {
    // res.json(err);
    return res.render("user/update", {
      err: err.message,
      user: "",
    });
  }
};

// user Detail Controller
const userDetailsCtrl = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    res.render("user/update", { user, err: "" });
  } catch (error) {}
};

// user password details
const userPasswordCtrl = async (req, res) => {
  const { password } = req.body;

  try {
    const user = User.findById(req.session.userAuth);
    res.render("user/updatePassword", { err: "" });
  } catch (error) {
    res.json(error);
  }
};
module.exports = {
  loginCntrl,
  logoutCntrl,
  passwordUpdateCntrl,
  userPasswordCtrl,
  profileCntrl,
  userDetailsCtrl,
  profilePhotoCntrl,
  profilePublicCntrl,
  registerCntrl,
  coverPhotoCntrl,
  updateUserCntrl,
};
