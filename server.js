require('dotenv').config()

const fastify = require("fastify")({ logger: true })
const fastifyenv = require("@fastify/env")
const { default: mongoose } = require('mongoose')
fastify.register(require("@fastify/sensible"))
fastify.register(require("@fastify/multipart"))
fastify.register(require("@fastify/static", {
    root: path.join(__dirname, "uploads"),
    prefix: '/uploads/', // optional: default '/'
}))
fastify.register(require("@fastify/cors"))

fastify.register(fastifyenv, {
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

// register custom column()
fastify.register(require("./plugins/mongodb"))
fastify.register(require("./plugins/jwt"))

// register routes
fastify.register(require("./routes/auth"), { prefix: "/api/auth" })



// declare a route
fastify.get('/', async (request, reply) => {
    return { hello: "world" }
})


// test database connection
fastify.get("/test-db", async (request, reply) => {
    try {
        const mongoose = fastify.mongoose
        const connectionState = mongoose.connection.readyState

        let status = ""

        switch (connectionState) {
            case 0:
                status = "disconnected"
                break
            case 1:
                status = "connected"
                break
            case 2:
                status = "connecting"
                break
            case 3:
                status = "disconnecting"
                break
            default:
                status = "unknown"
        }

        reply.send({ database: status })

    } catch (err) {
        fastify.log.error(err)
        reply.status(500).send({ error: "Failed to test database" })
    }
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

fastify.ready(() => {
    console.log(fastify.printRoutes())
})

start()