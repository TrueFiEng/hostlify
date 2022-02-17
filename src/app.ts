import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { exec } from 'child_process'
import { UploadRequest } from './types'
import { PORT, SERVER_TEMPLATE } from './constants'
import path from 'path'

const server = fastify()
server.register(fileUpload)

async function createFilePathDirectoriesIfNecessary(filePath: string) {
    const directoriesPath = path.dirname(filePath);
    if(!existsSync(directoriesPath)) {
        await fs.mkdir(directoriesPath, {recursive: true})
    }
}

server.post<UploadRequest>('/upload/:id', async (request, reply) => {

    const { id } = request.params
    console.log(id)
    const repositoryPath = `./repository/${id}`
    const configPath = `./config/serverConfigs/${id}.conf`
    const serverConfig = SERVER_TEMPLATE.replace(/{{serverName}}/g, id)

    try {
        await fs.writeFile(configPath, serverConfig)
        await createFilePathDirectoriesIfNecessary(repositoryPath)

        for (const [key, file] of Object.entries(request.body)) {
            const filePath = `${repositoryPath}/${key}`
            console.log(key)
            await createFilePathDirectoriesIfNecessary(filePath)
            await fs.writeFile(filePath, file.data)
        }
        exec('docker compose exec server1 nginx -s reload')
    }
    catch (err) {
        console.error(err)
        return reply.status(500).send(err)
    }

    const url = `${id}.lvh.me`
    return reply.status(201).send({url})
})

server.listen(PORT, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
