const User = require("../models/user.js")
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const { request } = require("http")


exports.register = async (request, reply) => {
    try {
        // validate body
        const { name, email, password } = request.body

        //    validate fields
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = new User({ name, email, password: hashedPassword })
        await user.save()
        reply.code(201).send({ message: "user registered successfully"})

    } catch (error) {
        reply.send(err)
    }
}


exports.login = async (request, reply) => {
    try {
        // validate fields
        const { email, password } = request.body
        const user = await User.findOne({ email })
        if (!user) {
            return reply.code(400).send({ message: "Invalid email or ppassowd" })
        }

        // validate the password
        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return reply.code(400).send({ message: "Invalid email or password" })
        }

        const token = request.server.jwt.sign({ id: user._id })

        reply.send({ token });



    } catch (err) {
        reply.send(err)
    }
}

exports.forgotPassword = async (request, reply) => {
    try {
        const { email } = request.body
        const user = await User.findOne({ email })

        if (!user) {
            return reply.notFound("user not found")

        }

        const resetToken = crypto.randomBytes(32).toString("hex")
        const resetPasswordExpire = Date.now() + 10 * 60 * 1000

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiry = resetPasswordExpire

        await user.save({ validateBeforeSave: false })

        const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`

        reply.send({ resetUrl })
    } catch (err) {
        reply.send(err)
    }

}



exports.resetPassword = async (request, reply) => {
    const resetToken = request.params.token
    const { newPassword } = request.body

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpiry: { $gt: Date.now() },

    })

    if (!user) {
        return reply.badRequest("Invalid or expired password resest token")


    }


    // hash the password 
    const hashhedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined

    await user.save()

    reply.send({ message: "password reset successfully" })

}


exports.logout = async(request, reply) => {
    // JWT are stateless, strategy liek refresh token or blaclist

    reply.send({message: "User logged out"})
}