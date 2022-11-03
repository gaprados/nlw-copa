import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@gmail.com',
      avatarUrl: 'https://thispersondoesnotexist.com/image',
    }
  })

  const poll = await prisma.poll.create({
    data: {
      title: 'Example poll',
      code: 'BOOL123',
      ownerId: user.id,

      participants: {
        create: {
          userId: user.id
        }
      }
    }
  })

  await prisma.game.create({
    data: {
      date: '2022-11-12T14:30:08.050Z',
      firstTeamCountryCode: 'DE',
      secondTeamCountryCode: 'FR',
    }
  })

  await prisma.game.create({
    data: {
      date: '2022-11-12T14:30:08.050Z',
      firstTeamCountryCode: 'AR',
      secondTeamCountryCode: 'BR',

      guesses: {
        create: {
          firstTeamPoints: 1,
          secondTeamPoints: 3,

          participant: {
            connect: {
              userId_pollId: {
                userId: user.id,
                pollId: poll.id
              }
            }
          }
        }
      }
    }
  })
}

main()
