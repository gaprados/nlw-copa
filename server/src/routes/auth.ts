import { FastifyInstance } from "fastify"
import { z, ZodError } from "zod";
import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: [authenticate]
  }, async (request, reply) => {
    return { user: request.user }
  })

  fastify.post('/users', async (request, reply) => {

    const createUserBody = z.object({
      access_token: z.string(),
    });

    const userInfoSchema = z.object({
      sub: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });


    try {
      const { access_token } = createUserBody.parse(request.body);
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });

      const userData = await userResponse.json();
      const userInfo = userInfoSchema.parse(userData);

      let user = await prisma.user.findUnique({
        where: {
          googleId: userInfo.sub
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: userInfo.sub,
            name: userInfo.name,
            email: userInfo.email,
            avatarUrl: userInfo.picture,
          }
        });
      };

      const token = fastify.jwt.sign({
        user: user.name,
        avatarUrl: user.avatarUrl,
      }, {
        sub: user.id,
        expiresIn: '7 days' //FIXME: MODIFICAR
      });

      return { token }
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessage = JSON.parse(err.message)[0];
        return reply.status(400).send({ error: errorMessage.message })
      }
    }
  })
}
