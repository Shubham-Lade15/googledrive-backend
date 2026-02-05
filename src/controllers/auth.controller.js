const bcrypt = require("bcrypt");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const ActivationToken = require("../models/ActivationToken");
const sendMail = require("../config/mail");
const generateToken = require("../utils/generateToken");
const ResetToken = require("../models/ResetToken");
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // basic validation
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already registered with this email" });
    }
    
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character ❌",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // username fallback to email if not provided
    const finalUsername = username ? username.toLowerCase() : email.toLowerCase();

    // check username uniqueness
    const usernameExists = await User.findOne({ username: finalUsername });
    if (usernameExists) {
      return res.status(400).json({
        message: "Username already exists ❌",
      });
    }

    // create inactive user
    const user = await User.create({
      firstName,
      lastName,
      username: finalUsername,
      email,
      password: hashedPassword,
      isActive: false,
    });

    // create activation token
    const token = uuidv4();

    await ActivationToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });

    // activation link
    const activationLink = `${process.env.CLIENT_URL}/activate/${token}`;

    // send activation email
    await sendMail({
      to: user.email,
      subject: "Activate your Google Drive Account",
      html: `
                <h2>Account Activation</h2>
                <p>Hello ${user.firstName},</p>
                <p>Please click the link below to activate your account:</p>
                <a href="${activationLink}" target="_blank">${activationLink}</a>
                <p>This link expires in 15 minutes.</p>
                `,
    });

    return res.status(201).json({
      message: "Registration successful ✅ Activation email sent. Please activate your account to login.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    const activation = await ActivationToken.findOne({ token });

    if (!activation) {
      return res.status(400).json({ message: "Invalid activation token ❌" });
    }

    if (activation.expiresAt < new Date()) {
      await ActivationToken.deleteOne({ token });
      return res.status(400).json({ message: "Activation token expired ❌" });
    }

    const user = await User.findById(activation.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    user.isActive = true;
    await user.save();

    await ActivationToken.deleteOne({ token });

    return res.status(200).json({ message: "Account activated successfully ✅ You can now login." });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // validation
    if (!identifier || !password) {
      return res.status(400).json({ message: "Username/Email and password are required" });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    // check activation
    if (!user.isActive) {
      return res.status(403).json({ message: "Account not activated ❌ Please activate via email." });
    }

    // password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials ❌" });
    }

    // generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    const token = uuidv4();

    await ResetToken.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
    });

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    await sendMail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Hello ${user.firstName},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "Password reset link sent to your email ✅",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, password } = req.body;
    const finalPassword = newPassword || password;

    if (!finalPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const resetToken = await ResetToken.findOne({ token });
    if (!resetToken) {
      return res.status(400).json({ message: "Invalid reset token ❌" });
    }

    if (resetToken.expiresAt < new Date()) {
      await ResetToken.deleteOne({ token });
      return res.status(400).json({ message: "Reset token expired ❌" });
    }

    const user = await User.findById(resetToken.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await ResetToken.deleteOne({ token });

    return res.status(200).json({
      message: "Password reset successful ✅ You can now login.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
