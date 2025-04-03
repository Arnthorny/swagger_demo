const express = require("express");
const Joi = require("joi");
const imgRouter = express.Router();

const imageModel = require("../models/imageModels");
const Auth = require("../basicAuthentication");

const uploadSchema = Joi.object({
  title: Joi.string().trim().required().max(30).min(1),
  url: Joi.string().trim().required().uri(),
});

const retrieveParamSchema = Joi.object({
  imageId: Joi.string().trim().length(24),
});

class imageController {
  /**
   * @swagger
   * /api/images:
   *   post:
   *     summary: Upload a new image
   *     description: Creates a new image entry with title and URL
   *     tags: [Images]
   *     security:
   *       - BasicAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - url
   *             properties:
   *               title:
   *                 type: string
   *                 description: Title of the image
   *               url:
   *                 type: string
   *                 description: URL of the image
   *     responses:
   *       201:
   *         description: Image uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Upload successful"
   *                 data:
   *                   $ref: '#/components/schemas/Image'

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
  static async uploadImage(req, res) {
    try {
      const validation = uploadSchema.validate(req.body);
      if (validation.error) res.status(422).json({ error: validation.error });

      const { title, url } = validation.value;
      const image = await imageModel.create({
        title,
        url,
        authorId: req.user._id,
      });

      res.status(201).json({
        message: "Upload successful",
        data: image,
      });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }

  /**
   * @swagger
   * /api/images:
   *   get:
   *     summary: Get all images
   *     description: Retrieves a list of all images in the database
   *     tags: [Images]
   *     responses:
   *       200:
   *         description: A list of images
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Image'
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericErrorStr'
   */
  static async getAllImages(req, res) {
    try {
      const allImages = await imageModel.find({});

      res.status(200).json(allImages);
    } catch (error) {
      res.status(500).json({
        error: String(error),
      });
    }
  }

  /**
   * @swagger
   * /api/images/{imageId}:
   *   get:
   *     summary: Get a single image by ID
   *     description: Retrieves a specific image by its ID
   *     tags: [Images]
   *     parameters:
   *       - in: path
   *         name: imageId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the image to retrieve
   *         example: "60d21b4667d0d8992e610c85"
   *     responses:
   *       200:
   *         description: Returns the requested image
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Image'
   *       404:
   *         description: Image not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericErrorStr'
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
  static async getSingleImage(req, res) {
    try {
      const validation = retrieveParamSchema.validate(req.params);

      if (validation.error) res.status(422).json({ error: validation.error });
      const { imageId } = validation.value;

      const img = await imageModel.findById(imageId);

      if (!img) res.status(404).json({ error: "Image not found" });
      else res.status(200).json(img);
    } catch (error) {
      res.status(500).json({
        error: String(error),
      });
    }
  }

  /**
   * @swagger
   * /api/images/{imageId}:
   *   delete:
   *     summary: Delete a single image
   *     description: Delete image by ID. Only image author can delete image.
   *     tags: [Images]
   *     security:
   *       - BasicAuth: []
   *     parameters:
   *       - in: path
   *         name: imageId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the image to delete
   *         example: "60d21b4667d0d8992e610c85"
   *     responses:
   *       204:
   *         description: Image successfully deleted (no content)
   *       401:
   *         description: Unauthorized - authentication required
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Unauthorized401'
   *       403:
   *         description: Forbidden - user is not the author of the image
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Forbidden from deleting"
   *       404:
   *         description: Image not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GenericErrorStr'
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
  static async deleteSingleImage(req, res) {
    try {
      const validation = retrieveParamSchema.validate(req.params);

      if (validation.error) res.status(422).json({ error: validation.error });
      const { imageId } = validation.value;

      const img = await imageModel.findById(imageId);

      if (img.authorId !== req.user._id)
        res.status(403).json({ error: "Forbidden from deleting" });
      else res.status(204);
    } catch (error) {
      res.status(500).json({
        error: String(error),
      });
    }
  }
}

imgRouter.post("/", Auth.basicAuthentication, imageController.uploadImage);
imgRouter.get("/", imageController.getAllImages);
imgRouter.get("/:imageId", imageController.getSingleImage);
imgRouter.delete(
  "/:imageId",
  Auth.basicAuthentication,
  imageController.deleteSingleImage
);

module.exports = imgRouter;
