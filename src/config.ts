export const BUN_CONFIG = Symbol("BUN_CONFIG");

export interface BunAppConfig {
    appName: string;
    version: string;
    storagePath: string;
}
