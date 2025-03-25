//packages
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
//import { v2 as cloudinary } from "cloudinary";

//models
//import User from "../models/userModel.js";
//import Notifcation from "../models/notificationsModel.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.log("error in getuserprofile", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { username, email, bio,fullname, currentPassword, newPassword } =
    req.body;
  let { profileImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res
        .status(400)
        .json({
          error: "please provide current password and your new password",
        });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "current password incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "password should be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.profileImg = profileImg || user.profileImg;
    user.username = username || user.username;

    user = await user.save();

    //password should be null in the response

    user.password = null;

    res.status(200).json({ user });
  } catch (error) {
    console.log("error in updatingUser", error.message);
    res.status(500).json({ error: error.message });
  }
};
