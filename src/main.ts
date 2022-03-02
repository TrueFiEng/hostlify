import { runServer } from "./api"
import { runNginx, updateApiConfig } from "./nginx"

async function main() {
    try {
        await updateApiConfig()
        runNginx()
        runServer()
    } catch(err) {
        console.error(err)
        process.exit(1)
    }
}

main()
