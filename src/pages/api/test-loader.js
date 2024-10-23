import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
    // Construct the path to the JSON file
    const filePath = path.join(process.cwd(), 'entity.schemas.json')

    // Read the file synchronously (you can use async/await for better performance)
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // Handle error if the file cannot be read
            res.status(500).json({ message: 'Error reading file' })
            return
        }

        // Parse the JSON data and send it as a response
        res.status(200).json(JSON.parse(data))
    })
}