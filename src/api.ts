import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'

import { getConfig } from './config'
import { PORT, HOST } from './constants'
import { listPreviewServers, reloadNginx, updatePreviewConfig, writePreviewContent } from './nginx'
import { Files, UploadParams } from './types'

const server = fastify({
    bodyLimit: 100_000_000_000, // ~100GB
})
server.register(fileUpload)

interface UploadRequest {
    Params: UploadParams,
    Body: Files,
}

server.post<UploadRequest>('/upload/:id', async (_request, reply) => {
    const { id } = _request.params
    console.log(id)
    const { domain } = getConfig()

    await updatePreviewConfig(id)
    await writePreviewContent(id, _request.body)
    reloadNginx()

    const url = `${id}.${domain}`
    return reply.status(201).send({url})
})

server.get('list', async (_request, reply) => {
    const previewServerList = await listPreviewServers()
    if(previewServerList.length === 0) {
        return reply.code(204).send(`There aren't any review servers there!`)
    }
    return reply.code(200).send({previewServerList})
})

export function runServer() {
    server.listen(PORT, HOST, async(err, address) => {
        if (err) {
            throw new Error(err.message)
        }
    console.log(`Server listening at ${address}`)
    })
}
