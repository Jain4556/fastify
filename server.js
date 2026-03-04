require('dotenv').config()

const fastify = require("fastify")({ logger: true })
const fastifyEnv = require("@fastify/env")
fastify.register(require("@fastify/sensible"))
fastify.register(require("@fastify/cors"))

fastify.register(fastifyEnv, {
    dotenv: true,
    schema: {
        type: "object",
        required: ["PORT", "MONGODB_URI", "JWT_TOKEN"],
        properties: {
            PORT: { type: "string", default: "3000" },
            MONGODB_URI: { type: "string" },
            JWT_TOKEN: { type: "string" }
        }
    }
})

fastify.get('/', async (request, reply) => {
    return { hello: "world" }
})

const start = async () => {
    try {
        await fastify.listen({ port: process.env.PORT || 3000 })
        console.log(fastify.config)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()