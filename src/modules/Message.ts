import { Extension, listener } from '@pikokr/command.ts'
import type { Message } from 'discord.js'

const replyWithSticker = async (msg: Message, name: string) => {
  if (!msg.guild) return

  const sticker = (await msg.guild.stickers.fetch()).find(
    (s) => s.name === name
  )

  if (!sticker) return

  await msg.reply({
    stickers: [sticker],
    allowedMentions: {
      repliedUser: false,
    },
  })
}

class MessageExt extends Extension {
  @listener({ event: 'messageCreate' })
  async onMessage(msg: Message) {
    if (msg.author.bot) return

    switch (msg.content) {
      case 'ㄴㄹㄹㅋㄹㄹ':
        await replyWithSticker(msg, 'ㄴㄹㄹㅋㄹㄹ')

        break

      case 'ㄴㅇㄴㅇ':
        await replyWithSticker(msg, 'ㄴㅇㄴㅇ')

        break
    }
  }
}

export const setup = async () => new MessageExt()
