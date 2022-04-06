import { setAuthCookie } from "$server/auth"
import { getJWT } from "$server/jwt"
import { prisma } from "$server/prisma"
import { NextApiHandler } from "next"

const handler: NextApiHandler = async (req, res) => {
  const token = req.query.token as string
  if (!token) return res.send("no token provided")

  const loginToken = await prisma.loginToken.findUnique({
    where: {
      id: token,
    },
  })

  if (!loginToken) {
    return res.send(`invalid token`)
  }

  let user = await prisma.user.findUnique({
    where: {
      email: loginToken.email,
    },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: loginToken.email,
        name: loginToken.email.split("@")[0],
      },
    })
  }

  setAuthCookie(res, await getJWT({ userId: user.id }))

  res.redirect("/dashboard")
}

export default handler
