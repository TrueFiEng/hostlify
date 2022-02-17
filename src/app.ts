import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'
import fs from 'fs'
import { exec } from 'child_process'
import { UploadRequest } from './types'
import { PORT, SERVER_TEMPLATE } from './constants'

const server = fastify()
server.register(fileUpload)

server.post<UploadRequest>('/upload/:id', async (request, reply) => {

    const { id } = request.params
    const repositoryPath = `./repository/${id}`
    const configPath = `./config/serverConfigs/${id}.conf`

    const status = fs.mkdirSync(repositoryPath, { recursive: true })

    const serverConfig = SERVER_TEMPLATE.replace(/{{serverName}}/g, id)
    fs.writeFileSync(configPath, serverConfig)

    for (const [key, file] of Object.entries(request.body)) {
        const filePath = `${repositoryPath}/${file.name}`
        fs.writeFileSync(filePath, file.data)
    }
    exec('docker compose up -d --force-recreate --no-deps --build server1')

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
