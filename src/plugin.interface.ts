import {BunRequestContext} from "./request-context";

export const PLUGIN_TOKEN = Symbol("APP_PLUGIN");

export interface AppPlugin {
    name: string;
    onAction(action: string, context: BunRequestContext): Promise<void> | void;
}
