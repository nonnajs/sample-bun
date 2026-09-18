import {AppPlugin} from "./plugin.interface";
import {BunRequestContext} from "./request-context";

export class LoggingPlugin implements AppPlugin {
    public readonly name = "LoggingPlugin";
    public readonly logs: string[] = [];

    onAction(action: string, context: BunRequestContext): void {
        const msg = `[${this.name}] Action '${action}' invoked for requestId: ${context.requestId}`;
        this.logs.push(msg);
        context.events.push(msg);
    }
}

export class MetricsPlugin implements AppPlugin {
    public readonly name = "MetricsPlugin";
    public invocationCount = 0;

    onAction(_action: string, context: BunRequestContext): void {
        this.invocationCount++;
        context.events.push(`[${this.name}] Total actions handled: ${this.invocationCount}`);
    }
}
