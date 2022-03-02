export interface Config {
    domain?: string
}

export function getConfig(): Config {
    return {
        domain: process.env.DOMAIN_NAME
    }
}
