import { Extension, listener } from '@pikokr/command.ts'
import type { Message } from 'discord.js'

const replyWithSticker = async (msg: Message, name: string) => {
  if (!msg.guild) return

  const sticker = msg.guild.stickers.cache.find((s) => s.name === name)

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

      case 'ㄴㅇㄴㅇㄴㅇ':
        await replyWithSticker(msg, 'ㄴㅇㄴㅇㄴㅇ')

        break
    }
  }
}

export const setup = async () => new MessageExt()
