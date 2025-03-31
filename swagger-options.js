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

module.exports = options;
