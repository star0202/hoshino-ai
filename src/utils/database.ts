import JSONDatabase from '../structures/Database'
import { join } from 'path'

export const database = new JSONDatabase(
  join(__dirname, '..', '..', 'data.json')
)
