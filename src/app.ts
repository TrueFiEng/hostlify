import fastify from 'fastify'
import fileUpload from 'fastify-file-upload'
import fs from 'fs'
import { UploadRequest } from './types'
import { PORT } from './constants'

const server = fastify()
server.register(fileUpload)

server.post<UploadRequest>('/upload/:id', async (request, reply) => {

    const { id } = request.params
    const repositoryPath = './repository/' + id

    fs.mkdir(repositoryPath, { recursive: true }, function(err) {
        if(err ) {
            console.log(err)
            return reply.status(400).send("done")
        }
    })

    for (const [key, file] of Object.entries(request.body)) {
        const filePath = repositoryPath + '/' + file.name
        fs.appendFile(filePath, file.data, (err) => {
            if(err) {
                console.log(err)
                return reply.status(400).send("cannot create file " + key)
            }
        })
    }

    return reply.status(200).send("done")
})

server.listen(PORT, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
