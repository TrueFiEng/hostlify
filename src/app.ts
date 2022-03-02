import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'

import { getConfig } from './config'
import { PORT, HOST } from './constants'
import { reloadNginxConfig, updateApiConfig, updatePreviewConfig, writePreviewContent } from './nginx'
import { Files, UploadParams } from './types'

const server = fastify({
    bodyLimit: 100_000_000_000, // ~100GB
})
server.register(fileUpload)

interface UploadRequest {
    Params: UploadParams,
    Body: Files,
}

server.post<UploadRequest>('/upload/:id', async (request, reply) => {
    const { id } = request.params
    console.log(id)
    const { domain } = getConfig()

    await updatePreviewConfig(id)
    await writePreviewContent(id, request.body)
    reloadNginxConfig()

    const url = `${id}.${domain}`
    return reply.status(201).send({url})
})

function runServer() {
    server.listen(PORT, HOST, async(err, address) => {
        if (err) {
            throw new Error(err.message)
    }
    console.log(`Server listening at ${address}`)
    })
}

async function main() {
    try {
        await updateApiConfig()
        runServer()
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}

(async () => {
    await main()
})()
