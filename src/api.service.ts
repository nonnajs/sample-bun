import {Inject, Injectable} from "@nonnajs/di";
import {AppPlugin} from "./plugin.interface";
import {BunRequestContext} from "./request-context";
import {StorageService} from "./storage.service";

@Injectable({scope: "request"})
export class ApiService {
    constructor(
        @Inject(StorageService) private readonly storage: StorageService,
        @Inject(BunRequestContext) private readonly context: BunRequestContext,
    ) {}

    async execute(action: string, payload: any, plugins: readonly AppPlugin[] = []): Promise<any> {
        this.context.events.push(`Executing action: ${action}`);

        for (const plugin of plugins) {
            await plugin.onAction(action, this.context);
        }

        const record = {
            action,
            payload,
            requestId: this.context.requestId,
            events: [...this.context.events],
        };

        this.storage.set(this.context.requestId, record);
        return record;
    }
}
