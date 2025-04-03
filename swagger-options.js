const { string } = require("joi");
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.4",
    info: {
      title: "T-Image Upload API",
      description: "API documentation for Timage Service",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        BasicAuth: {
          type: "http",
          scheme: "basic",
        },
      },
      schemas: {
        Image: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "60d21b4667d0d8992e610c85",
            },
            title: {
              type: "string",
              example: "Mountain landscape",
            },
            url: {
              type: "string",
              example: "https://example.com/image.jpg",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-05-20T15:24:33.456Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2023-05-20T15:24:33.456Z",
            },
            authorId: {
              type: "string",
              example: "60d21b4667d0d8992e610c85",
            },
          },
        },
        GenericErrorStr: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "error message",
            },
          },
        },
        Unauthorized401: {
          type: "object",
          properties: {
            error: { type: "string", example: "Unauthorized" },
          },
        },
        SignupLoginRequestBody: {
          type: "object",
          properties: {
            username: {
              type: "string",
              required: true,
              description: "User's unique username",
            },
            password: {
              type: "string",
              required: true,
            },
          },
        },
        SignupLoginResponseBody: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Request successful",
            },
            data: {
              type: "object",
              properties: {
                username: {
                  type: "string",
                  example: "johndoe",
                },
                _id: {
                  type: "string",
                  example: "60d21b4667d0d8992e610c85",
                },
              },
            },
          },
        },
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"], // files containing annotations as above
};

// swaggerJsdoc(swaggerDocOptions)
const OASdoc = swaggerJsdoc(options);
module.exports = OASdoc;
