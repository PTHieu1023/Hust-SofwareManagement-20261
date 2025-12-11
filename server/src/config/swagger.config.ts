import env from '@/utils/env.utils';
import swaggerJsdoc, { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'E-Learning Platform API',
        version: '1.0.0',
        description: 'API documentation for E-Learning Platform',
        contact: {
            name: 'HUST Group 1',
            email: 'support@elearning.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: `http://localhost:${env.PORT}`,
            description: 'Development server',
        },
        {
            url: `http://localhost:${env.PORT}/api`,
            description: 'Development API server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token in the format: Bearer <token>',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'An unexpected error occurred',
                    },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'user@example.com',
                    },
                    username: {
                        type: 'string',
                        example: 'johndoe',
                    },
                    fullName: {
                        type: 'string',
                        example: 'John Doe',
                    },
                    role: {
                        type: 'string',
                        enum: ['STUDENT', 'TEACHER', 'ADMIN'],
                        example: 'STUDENT',
                    },
                    isBanned: {
                        type: 'boolean',
                        example: false,
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                    },
                },
            },
            Course: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                    },
                    title: {
                        type: 'string',
                        example: 'Introduction to Programming',
                    },
                    description: {
                        type: 'string',
                        example: 'Learn the basics of programming',
                    },
                    teacherId: {
                        type: 'string',
                        format: 'uuid',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                    },
                },
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],
};

const options: swaggerJsdoc.Options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
