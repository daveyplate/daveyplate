import { promises as fs } from 'fs'
import path from 'path'

export default async function handler(req, res) {
    const filePath = path.join(process.cwd(), 'entity.schemas.json');
    const file = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(file))
}