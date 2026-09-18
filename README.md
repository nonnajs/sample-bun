# `@nonnajs/sample-bun`

Sample Bun application demonstrating `@nonnajs/di` in Bun runtime.

## Dependency Injection At A Glance

`src/app.ts` registers two plugin classes under the same `multi: true` token, and a request-scoped
`ApiService` (`src/api.service.ts`) that receives whichever plugins the caller resolved for it:

```ts
injector.register({provide: PLUGIN_TOKEN, useClass: LoggingPlugin, multi: true});
injector.register({provide: PLUGIN_TOKEN, useClass: MetricsPlugin, multi: true});
```

```ts
@Injectable({scope: "request"})
export class ApiService {
    constructor(
        @Inject(StorageService) private readonly storage: StorageService,
        @Inject(BunRequestContext) private readonly context: BunRequestContext,
    ) {}

    async execute(action: string, payload: any, plugins: readonly AppPlugin[] = []) {
        for (const plugin of plugins) {
            await plugin.onAction(action, this.context);
        }
        this.storage.set(this.context.requestId, {action, payload, requestId: this.context.requestId});
    }
}
```

`injector.getAll()` resolves every `PLUGIN_TOKEN` registration in order and passes them in, all
inside a fresh `runInScope()` per call:

```ts
return injector.runInScope(async () => {
    const apiService = injector.get(ApiService);
    const plugins = injector.getAll<AppPlugin>(PLUGIN_TOKEN);
    return apiService.execute(action, payload, plugins);
});
```

## Features Demonstrated

-   **Bun Runtime Support**: Zero-reflection dependency injection directly within the Bun JavaScript runtime.
-   **Multi-Providers**: Registering multiple plugin implementations under a single `PLUGIN_TOKEN` symbol and resolving via `injector.getAll()`.
-   **Request Scopes**: Isolating request-specific context (`BunRequestContext`) and request-scoped services (`ApiService`) with `injector.runInScope()`.
-   **Lifecycle Teardown**: Teardown of resources (`StorageService`) using `OnDestroy`.

## Running the Sample

```sh
# Run with Bun
bun run src/index.ts

# Run tests with Bun
bun test test/

# Or run via pnpm in the monorepo
pnpm test
pnpm build
```
