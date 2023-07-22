import type { Message } from '../types'
import { readFile, writeFile } from 'fs/promises'

type Data = {
  messages: Message[]
}

const isSameMessage = (a: Message, b: Message) =>
  a.guild === b.guild && a.channel === b.channel && a.message === b.message

export default class JSONDatabase {
  private filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
  }

  private async readFile(): Promise<Data> {
    const fileData = await readFile(this.filePath, 'utf-8')

    return JSON.parse(fileData)
  }

  private async writeFile(data: Data): Promise<void> {
    const fileData = JSON.stringify(data, null, 2)
    await writeFile(this.filePath, fileData, 'utf-8')
  }

  async getMessage(message: Message): Promise<Message | undefined> {
    const { messages } = await this.readFile()

    return messages.find((m) => isSameMessage(m, message))
  }

  async updateMessage(message: Message): Promise<void> {
    const data = await this.readFile()

    const index = data.messages.findIndex((m) => isSameMessage(m, message))

    if (index === -1) {
      data.messages.push(message)
    } else {
      data.messages[index] = message
    }

    await this.writeFile(data)
  }

  async deleteMessage(message: Message): Promise<void> {
    const data = await this.readFile()

    const index = data.messages.findIndex((m) => isSameMessage(m, message))
    data.messages.splice(index, 1)

    await this.writeFile(data)
  }
}
