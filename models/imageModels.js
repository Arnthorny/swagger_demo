const mongoose = require("mongoose");

const { ObjectId } = mongoose.Schema.Types;

const imgSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    url: { type: String, required: true, unique: true },

    authorId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const imgModel = mongoose.model("Image", imgSchema);

module.exports = imgModel;

// const nasaImg = await imgModel.create({
//   name: "NasaImage",
//   url: "https://apod.nasa.gov/apod/image/1707/Messier106_NGC4217Feltoti1024.jpg",
// });

// console.log(nasaImg.createdAt); // 2022-02-26T16:37:48.244Z
// console.log(nasaImg.updatedAt);

// // const savedImg = await nasaImg.save();

// console.log(nasaImg);

// const images = await imgModel.find();
// console.log(images);
