import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateTokenAndSetCookies } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { username, fullname, password, email } = req.body;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existUser = await User.findOne({ username });
    if (existUser) {
      return res
        .status(400)
        .json({ error: "Username already taken by another user" });
    }

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    if (!generateTokenAndSetCookies) {
      console.error("generateTokenAndSetCookies is not defined");
      return res.status(500).json({ error: "Token generation failed" });
    }

    let token;
    try {
      token = generateTokenAndSetCookies(newUser._id, res);
    } catch (tokenError) {
      console.error("Error generating token:", tokenError);
      return res
        .status(500)
        .json({ error: "Failed to generate authentication token" });
    }

    res.status(201).json({
      success: true,
      token,
      _id: newUser._id,
      username: newUser.username,
      fullname: newUser.fullname,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      bio: newUser.bio,
      link: newUser.link,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });
  } catch (error) {
    console.error("Detailed error in signup controller:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        error: "Duplicate key error",
        details: error.message,
      });
    }

    res.status(500).json({
      error: "Server error occurred during signup",
      message: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const user = await User.findOne({ username });

    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordValid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = generateTokenAndSetCookies(user._id, res);

    res.status(200).json({
      success: true,
      token: token,
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      followers: user.followers,
      following: user.following,
      bio: user.bio,
      link: user.link,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (error) {
    console.error("Detailed error in login controller:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    res.status(500).json({
      error: "Server error occurred during login",
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller");
    res.status(500).json("it was server error");
  }
};

export const checkMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in checkMe controller");
    res.status(500).json("it was server error");
  }
};
