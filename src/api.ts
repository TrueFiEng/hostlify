import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'

import { getConfig } from './config'
import { PORT, HOST } from './constants'
import { deletePreviewServer, listPreviewServers, reloadNginx, updatePreviewConfig, writePreviewContent } from './nginx'
import { Files, IdParams } from './types'

const server = fastify({
    bodyLimit: 100_000_000_000, // ~100GB
})
server.register(fileUpload)

interface UploadRequest {
    Params: IdParams
    Body: Files
}

server.post<UploadRequest>('/upload/:id', async (_request, reply) => {
    const { id } = _request.params
    const { domain } = getConfig()
    console.log('upload ' + id)

    await updatePreviewConfig(id)
    await writePreviewContent(id, _request.body)
    reloadNginx()

    const url = `${id}.${domain}`
    return reply.status(201).send({url})
})

server.get('/list', async (_request, reply) => {
    console.log('list')

    const previewServerList = await listPreviewServers()
    if(previewServerList.length === 0) {
        return reply.code(204).send(`There aren't any review servers there!`)
    }
    return reply.code(200).send({previewServerList})
})

interface DeleteDirectoryRequest {
    Params: IdParams
}

server.delete<DeleteDirectoryRequest>('/:id', async (_request, reply) => {
    const { id } = _request.params
    console.log('delete ' + id)

    const deleteStatus = await deletePreviewServer(id)
    return deleteStatus 
    ? reply.code(204).send(`Server preview was deleted successfully`) 
    : reply.code(404).send(`Server preview with that name doesn't exist`)
})

export function runServer() {
    server.listen(PORT, HOST, async(err, address) => {
        if (err) {
            throw new Error(err.message)
        }
    console.log(`Server listening at ${address}`)
    })
}
