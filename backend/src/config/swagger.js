import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lunch Attendance Management API',
      version: '1.0.0',
      description: 'The backend REST APIs powering the Lunch and Attendance Platform',
      contact: {
        name: 'Developer',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://your-production-url.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  // Paths to files containing OpenAPI definitions
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
