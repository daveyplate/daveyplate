import { promises as fs } from 'fs'

export default async function handler(req, res) {
    const file = await fs.readFile(process.cwd() + '/entity.schemas.json', 'utf8');
    res.json(JSON.parse(file))
}