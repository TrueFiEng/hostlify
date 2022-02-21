import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { exec } from 'child_process'
import { PORT, SERVER_TEMPLATE, HOST, NGINX_TEMPLATE } from './constants';
import path from 'path'
import { File } from './types'

const domain = process.env.DOMAIN_NAME
const configsPath = `./etc/nginx/serverConfigs`

export interface UploadParams {
    id: string
}

export interface UploadRequest {
    Params: UploadParams,
    Body: {
        [file: string]: File
    }
}

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
    const repositoryPath = `./usr/share/nginx/html/${id}`
    const configPath = `${configsPath}/${id}.conf`
    if(!domain) {
        return reply.status(500).send('Domain variable is not set!')
    }
    const serverConfig = SERVER_TEMPLATE.replace(/{{serverName}}/g, id).replace('{{domain}}', domain)

    try {
        await fs.writeFile(configPath, serverConfig)
        await createFilePathDirectoriesIfNecessary(repositoryPath)

        for (const [key, file] of Object.entries(request.body)) {
            const filePath = `${repositoryPath}/${key}`
            console.log(key)
            await createFilePathDirectoriesIfNecessary(filePath)
            await fs.writeFile(filePath, file.data)
        }
        exec('nginx -s reload')
    }
    catch (err) {
        console.error(err)
        return reply.status(500).send(err)
    }

    const url = `${id}.${domain}`
    return reply.status(201).send({url})
})

server.listen(PORT, HOST, async(err, address) => {
  if (err || !domain) {
    console.error(err)
    process.exit(1)
  }
  await createFilePathDirectoriesIfNecessary(configsPath)
  const configFileContent = NGINX_TEMPLATE.replace('{{domain}}', domain)
  await fs.writeFile(`${configsPath}`, configFileContent)
  console.log(`Server listening at ${address}`)
})
