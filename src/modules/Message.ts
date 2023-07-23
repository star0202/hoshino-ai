import { Extension, listener } from '@pikokr/command.ts'
import type { Message } from 'discord.js'

class MessageExt extends Extension {
  @listener({ event: 'messageCreate' })
  async onMessage(msg: Message) {
    if (msg.author.bot || !msg.guild) return

    switch (msg.content) {
      case 'ㄴㄹㄹㅋㄹㄹ': {
        const sticker = (await msg.guild.stickers.fetch()).find(
          (s) => s.name === 'ㄴㄹㄹㅋㄹㄹ'
        )

        if (!sticker) return

        await msg.reply({
          stickers: [sticker],
          allowedMentions: {
            repliedUser: false,
          },
        })

        break
      }
    }
  }
}

export const setup = async () => new MessageExt()
