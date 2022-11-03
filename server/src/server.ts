import Fastify from "fastify";
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { z, ZodError } from 'zod';
import ShordUniqueId from 'short-unique-id'

const prisma = new PrismaClient({
  log: ['query'],
});

async function bootstrap() {
  const fastify = Fastify({
    logger: true
  });

  await fastify.register(cors, { origin: true });

  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count()
    return { count }
  })

  fastify.get("/users/count", async () => {
    const count = await prisma.user.count()
    return { count }
  })

  fastify.get("/guesses/count", async () => {
    const count = await prisma.guess.count()
    return { count }
  })

  fastify.post("/pools", async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    })

    try {
      const { title } = createPoolBody.parse(request.body);

      const generate = new ShordUniqueId({ length: 6 })

      const code = String(generate()).toUpperCase()

      await prisma.pool.create({
        data: {
          title,
          code
        }
      })

      return reply.status(201).send({ code })
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessage = JSON.parse(err.message)[0];
        return reply.status(400).send({ error: errorMessage.message })
      }
    }
  })

  await fastify.listen({ port: 3333, host: '0.0.0.0' });
}

bootstrap();