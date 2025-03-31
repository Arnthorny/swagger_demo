const mongoose = require("mongoose");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const express = require("express");
const userRouter = require("./routes/userRoutes");
const imgRouter = require("./routes/imageRoutes");
const swaggerDocOptions = require("./swagger-options");

const app = express();

async function initial_set_up() {
  const openapiSpecification = swaggerJsdoc(swaggerDocOptions);

  app.use(express.json());
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openapiSpecification));
  app.use("/api/auth", userRouter);
  app.use("/api/images", imgRouter);
}

async function main() {
  let mongo_conn;
  try {
    mongoose.set("strictQuery", true);

    mongo_conn = await mongoose.connect(process.env.MONGOURI);
    await initial_set_up();

    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

main();
