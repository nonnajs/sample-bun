import {Injectable} from "@nonnajs/di";

@Injectable({scope: "request"})
export class BunRequestContext {
    public requestId: string = `bun-req-${Math.random().toString(36).substring(2, 9)}`;
    public timestamp: number = Date.now();
    public events: string[] = [];
}
