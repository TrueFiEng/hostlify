import { existsSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'

export async function createFilePathDirectoriesIfNecessary(filePath: string) {
    const directoriesPath = path.dirname(filePath)
    if(!existsSync(directoriesPath)) {
        await fs.mkdir(directoriesPath, {recursive: true})
    }
}
