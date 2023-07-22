/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Confirm from '../structures/components/Confirm'
import { database } from '../utils/database'
import { Extension, applicationCommand, listener } from '@pikokr/command.ts'
import {
  ActionRowBuilder,
  ApplicationCommandType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  RoleSelectMenuBuilder,
} from 'discord.js'
import type { MessageComponentInteraction } from 'discord.js'

const buttonStyleCycle = [
  ButtonStyle.Primary,
  ButtonStyle.Success,
  ButtonStyle.Danger,
]

class Role extends Extension {
  @applicationCommand({
    name: 'setup',
    type: ApplicationCommandType.ChatInput,
    description: 'Setup button roles',
  })
  async setup(i: ChatInputCommandInteraction) {
    if (!i.guild || !i.channel?.isTextBased()) return

    if (!i.memberPermissions?.has('268435456'))
      return await i.reply({
        content: 'Permission denied',
        ephemeral: true,
      })

    await i.deferReply({
      ephemeral: true,
    })

    const res = await i.editReply({
      content: 'Select roles to add',
      components: [
        new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
          new RoleSelectMenuBuilder()
            .setCustomId('role')
            .setPlaceholder('Select roles')
            .setMinValues(1)
            .setMaxValues(5)
        ),
        new Confirm(),
      ],
    })

    let selected: string[] = []
    res
      .createMessageComponentCollector({
        filter: (j: MessageComponentInteraction) =>
          j.user.id === i.user.id && j.customId === 'role',
        componentType: ComponentType.RoleSelect,
      })
      .on('collect', async (j) => {
        await j.deferUpdate()

        selected = j.values
      })

    res
      .createMessageComponentCollector({
        filter: (j: MessageComponentInteraction) => j.user.id === i.user.id,
        componentType: ComponentType.Button,
      })
      .on('collect', async (j) => {
        await j.deferUpdate()
        switch (j.customId) {
          case 'confirm': {
            const roles = (await i.guild!.roles.fetch())
              .filter((r) => selected.includes(r.id))
              .map((r) => r)

            const msg = await i.channel!.send({
              content: 'Click to get / remove roles',
              components: [
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                  roles.map((r, idx) =>
                    new ButtonBuilder()
                      .setCustomId(`role${r.id}`)
                      .setLabel(r.name)
                      .setStyle(buttonStyleCycle[idx % buttonStyleCycle.length])
                  )
                ),
              ],
            })

            await i.editReply({
              content: '✅ Done',
              components: [],
            })

            await database.updateMessage({
              guild: msg.guildId!,
              channel: msg.channelId,
              message: msg.id,
            })

            break
          }
          case 'cancel':
            await j.deferUpdate()

            await i.editReply({
              content: '❌ Canceled',
              components: [],
            })

            break
        }
      })
  }

  @listener({
    event: 'interactionCreate',
  })
  async onButtonInteraction(i: MessageComponentInteraction) {
    if (!i.isButton()) return

    if (!i.customId.startsWith('role')) return

    const message = await database.getMessage({
      guild: i.guildId!,
      channel: i.channelId,
      message: i.message.id,
    })

    if (!message) return

    await i.deferUpdate()

    const role = await i.guild!.roles.fetch(i.customId.slice(4))

    if (!role) return

    const member = await i.guild!.members.fetch(i.user.id)

    if (member.roles.cache.has(role.id)) {
      await member.roles.remove(role)

      return
    }

    await member.roles.add(role)
  }
}

export const setup = async () => new Role()
