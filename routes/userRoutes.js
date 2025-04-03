const express = require("express");
const Joi = require("joi");
const userRouter = express.Router();
const bcrypt = require("bcryptjs");

const userModel = require("../models/userModels");
const Auth = require("../basicAuthentication");

const loginSignupSchema = Joi.object({
  username: Joi.string().trim().required().max(30).min(1),
  password: Joi.string().trim().required().max(30).min(1),
});

const resetPasswordSchema = Joi.object({
  oldPassword: Joi.string().trim().required().max(30).min(1),
  newPassword: Joi.string().trim().required().max(30).min(1),
});

class userController {
  /**
   * @swagger
   * /api/auth/signup:
   *   post:
   *     summary: Register a new user
   *     description: Creates a new user account with username and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *               $ref: '#/components/schemas/SignupLoginRequestBody'
   *     responses:
   *       201:
   *         description: Signup successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SignupLoginResponseBody'
   *       400:
   *         description: Bad request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       422:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: object
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericErrorStr'
   */
  static async signup(req, res) {
    try {
      const validation = loginSignupSchema.validate(req.body);

      if (validation.error) res.status(422).json({ error: validation.error });

      const { username, password } = validation.value;
      const user = await userModel.create({
        username,
        password: bcrypt.hashSync(password, 15),
      });

      res.status(201).json({
        message: "Signup successful",
        data: {
          username: user.username,
          _id: user._id,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        res
          .status(400)
          .json({ message: `Username ${req.body.username} already exists` });
      } else res.status(500).json({ error: String(error) });
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Login user
   *     description: Login user account given username and password
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *               $ref: '#/components/schemas/SignupLoginRequestBody'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SignupLoginResponseBody'
   *       422:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: object
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericErrorStr'
   */

  static async login(req, res) {
    try {
      const validation = loginSignupSchema.validate(req.body);

      if (validation.error) res.status(422).json({ error: validation.error });
      const { username, password } = validation.value;

      const user = await userModel.findOne({ username });

      if (!user || !bcrypt.compareSync(password, user.password))
        res.status(400).json({ message: "Invalid username or password" });
      else {
        res.status(200).json({
          message: "Login successful",
          data: {
            username: user.username,
            _id: user._id,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  /**
   * @swagger
   * /api/auth/reset-password:
   *   patch:
   *     summary: Reset user password
   *     description: Change a user password after validating old password
   *     tags: [Authentication]
   *     security:
   *       - BasicAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - oldPassword
   *               - newPassword
   *             properties:
   *               oldPassword:
   *                 type: string
   *                 description: User's current password
   *               newPassword:
   *                 type: string
   *                 description: User's new password
   *     responses:
   *       200:
   *         description: Password updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Password updated successfully"
   *       400:
   *         description: Invalid old password
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericErrorStr'
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Unauthorized401'
   *       422:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: object
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericErrorStr'
   */

  static async resetPassword(req, res) {
    try {
      const validation = resetPasswordSchema.validate(req.body);

      if (validation.error) res.status(422).json({ error: validation.error });
      const { oldPassword, newPassword } = validation.value;

      if (!bcrypt.compareSync(oldPassword, req.user.password))
        res.status(400).json({ error: "Invalid old password" });
      else {
        req.user.password = bcrypt.hashSync(newPassword, 15);
        await req.user.save();

        res.status(200).json({ message: "Password updated successfully" });
      }
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
}

userRouter.post("/login", userController.login);
userRouter.post("/signup", userController.signup);
userRouter.patch(
  "/reset-password",
  Auth.basicAuthentication,
  userController.resetPassword
);

module.exports = userRouter;
