import { FastifyInstance } from "fastify"
import { z, ZodError } from 'zod';
import ShordUniqueId from 'short-unique-id'

import { prisma } from "../lib/prisma"
import { authenticate } from "../plugins/authenticate";

export async function pollRoutes(fastify: FastifyInstance) {
  fastify.get("/polls/count", async () => {
    const count = await prisma.poll.count()
    return { count }
  })

  fastify.post("/polls", async (request, reply) => {
    const createpollBody = z.object({
      title: z.string(),
    })

    try {
      const { title } = createpollBody.parse(request.body);

      const generate = new ShordUniqueId({ length: 6 })

      const code = String(generate()).toUpperCase()

      try {
        await request.jwtVerify();

        await prisma.poll.create({
          data: {
            title,
            code,
            ownerId: request.user.sub,
            participants: {
              create: {
                userId: request.user.sub,
              }
            }
          }
        })
      } catch {
        await prisma.poll.create({
          data: {
            title,
            code
          }
        });
      }

      return reply.status(201).send({ code })
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessage = JSON.parse(err.message)[0];
        return reply.status(400).send({ error: errorMessage.message })
      }
    }
  })

  fastify.post("/polls/join", {
    onRequest: [authenticate]
  }, async (request, reply) => {
    const joinPollBody = z.object({
      code: z.string()
    })

    const { code } = joinPollBody.parse(request.body);

    const poll = await prisma.poll.findUnique({
      where: {
        code
      },
      include: {
        participants: {
          where: {
            userId: request.user.sub
          }
        }
      }
    })

    if (!poll) {
      return reply.status(400).send({ error: "Poll not found" })
    }


    if (poll.participants.length > 0) {
      return reply.status(400).send({ error: "You already joined this poll" })
    }

    if (!poll.ownerId) {
      await prisma.poll.update({
        where: {
          id: poll.id
        },
        data: {
          ownerId: request.user.sub
        }
      })
    }

    await prisma.participant.create({
      data: {
        pollId: poll.id,
        userId: request.user.sub
      }
    })
    return reply.status(200).send()
  })

  fastify.get("/polls", {
    onRequest: [authenticate]
  }, async (request, reply) => {
    const polls = await prisma.poll.findMany({
      where: {
        participants: {
          some: {
            userId: request.user.sub
          }
        }
      },
      include: {
        _count: {
          select: {
            participants: true
          }
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        owner: {
          select: {
            name: true,
            id: true
          }
        }
      }

    });

    return { polls }
  })

  fastify.get("/polls/:id", {
    onRequest: [authenticate]
  }, async (request, reply) => {
    const getPollParams = z.object({
      id: z.string(),
    })

    const { id } = getPollParams.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: {
        id
      },
      include: {
        _count: {
          select: {
            participants: true
          }
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                avatarUrl: true
              }
            }
          },
          take: 4
        },
        owner: {
          select: {
            name: true,
            id: true
          }
        }
      }

    });

    return { poll }

  })
}
