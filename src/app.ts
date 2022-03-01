import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'
import fs from 'fs/promises'
import { existsSync } from 'fs'
import { exec } from 'child_process'
import { PORT, SERVER_TEMPLATE, HOST, NGINX_TEMPLATE } from './constants';
import path from 'path'
import { File } from './types'

// TODO: Move to config.ts create interface Config and getConfig
const domain = process.env.DOMAIN_NAME
interface Config {
    domain: string
}
function getConfig(): Config {
    return {
        domain: process.env.DOMAIN_NAME
    }
}


// TODO: Move to ./nginx.ts as NIGINX_CONFIG_PATH
const configPath= `./etc/nginx`


const server = fastify()
server.register(fileUpload)


async function createFilePathDirectoriesIfNecessary(filePath: string) {
    const directoriesPath = path.dirname(filePath);
    if(!existsSync(directoriesPath)) {
        await fs.mkdir(directoriesPath, {recursive: true})
    }
}

interface UploadRequest {
    Params: {
        id: string
    },
    Body: {
        [file: string]: File
    }
}

server.post<UploadRequest>('/upload/:id', async (request, reply) => {

    const { id } = request.params
    console.log(id)


    // TODO: Extract to ./nginx.ts as function updatePreviewConfig
    {
        // Extact '/usr/share/nginx/html' as REPOSITORY_PATH
        const repositoryPath = `/usr/share/nginx/html/${id}`
        const serverConfigPath = `${configPath}/serverConfigs/${id}.conf`
        if(!domain) {
            // throw new Error('Domain variable is not set!')
            return reply.status(500).send('Domain variable is not set!')
        }
        const serverConfig = SERVER_TEMPLATE.replace(/{{serverName}}/g, id).replace('{{domain}}', domain)
    }

    try {
        // TODO: Extract to ./nginx.ts as function updatePreviewConfig
        await createFilePathDirectoriesIfNecessary(serverConfigPath)
        await fs.writeFile(serverConfigPath, serverConfig)


        // TODO: Extract as function writePreviewContent in this file
        await createFilePathDirectoriesIfNecessary(repositoryPath)

        for (const [key, file] of Object.entries(request.body)) {
            const filePath = `${repositoryPath}/${key}`
            console.log(key)
            await createFilePathDirectoriesIfNecessary(filePath)
            await fs.writeFile(filePath, file.data)
        }

        // TODO: Extract to ./nginx.ts as separate function reloadNginxConfig()
        exec('nginx -s reload') // TODO: await exec or execSync (better await exec)
    }
    catch (err) {
        console.error(err)
        return reply.status(500).send(err)
    }

    const url = `${id}.${domain}`
    return reply.status(201).send({url})
})

server.listen(PORT, HOST, async(err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    await prepareServer()
  console.log(`Server listening at ${address}`)
})

async function prepareServer() {
    if (!domain) {
        throw new Error('Domain variable is not set!')
    }
    console.log(domain)

    // Extract to ./nginx.ts as updateApiConfig
    await createFilePathDirectoriesIfNecessary(`${configPath}/serverConfigs/config`)
    const configFileContent = NGINX_TEMPLATE.replace('{{domain}}', domain)
    await fs.writeFile(`${configPath}/nginx.conf`, configFileContent)
    exec('nginx -c /etc/nginx/nginx.conf')
}




async function main() {
    try {
        await prepareServer()
    
        await server.listen(HOST,PORT)
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}