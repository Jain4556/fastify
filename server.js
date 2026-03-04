const fastify = require("fastify")({logger: true})



// Declare a route
fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})



const start = async () => {
    try {
        await fastify.listen({port: 4000 })
        fastify.log.info(
            `Server is running at http://localhost:${process.env.PORT}`
        )
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()