export interface Config {
    domain: string | undefined
}

export function getConfig(): Config {
    return {
        domain: process.env.DOMAIN_NAME
    }
}
