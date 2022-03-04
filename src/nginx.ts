
import { execSync } from 'child_process'
import fs from 'fs/promises'

import { getConfig } from './config'
import { createFilePathDirectoriesIfNecessary } from './fs-utils'
import { NGINX_TEMPLATE, SERVER_TEMPLATE } from './nginxConfigTemplates'
import { Files } from './types'

const REPOSITORY_PATH = '/usr/share/nginx/html'
const NIGINX_CONFIG_PATH= `/etc/nginx`

export async function updatePreviewConfig(id: string) {
    const { domain } = getConfig()
    if(!domain) {
        throw new Error('Domain variable is not set!')
    }
    
    const serverConfigPath = `${NIGINX_CONFIG_PATH}/serverConfigs/${id}.conf`
    const serverConfig = SERVER_TEMPLATE.replace(/{{serverName}}/g, id).replace('{{domain}}', domain)

    await createFilePathDirectoriesIfNecessary(serverConfigPath)
    await fs.writeFile(serverConfigPath, serverConfig)

    reloadNginxConfig()
}

export async function writePreviewContent(id: string, files: Files) {
    const repositoryPath = `${REPOSITORY_PATH}/${id}`
    await createFilePathDirectoriesIfNecessary(repositoryPath)

    for (const [key, file] of Object.entries(files)) {
        const filePath = `${repositoryPath}/${key}`
        console.log(key)
        await createFilePathDirectoriesIfNecessary(filePath)
        await fs.writeFile(filePath, Buffer.from(file.data), 'binary')
    }
}

export async function updateApiConfig() {
    const { domain } = getConfig()
    if(!domain) {
        throw new Error('Domain variable is not set!')
    }

    await createFilePathDirectoriesIfNecessary(`${NIGINX_CONFIG_PATH}/serverConfigs/config`)
    const configFileContent = NGINX_TEMPLATE.replace('{{domain}}', domain)
    await fs.writeFile(`${NIGINX_CONFIG_PATH}/nginx.conf`, configFileContent)
}

export function runNginx() {
    execSync('nginx -c /etc/nginx/nginx.conf')
}

export function reloadNginxConfig() {
    execSync('nginx -s reload')
}