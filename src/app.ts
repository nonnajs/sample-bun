import {Injector} from "@nonnajs/di";
import {ApiService} from "./api.service";
import {BUN_CONFIG, BunAppConfig} from "./config";
import {AppPlugin, PLUGIN_TOKEN} from "./plugin.interface";
import {LoggingPlugin, MetricsPlugin} from "./plugins";
import {StorageService} from "./storage.service";

export async function createBunApp(config: BunAppConfig): Promise<Injector> {
    const injector = Injector.create();

    // Register config value
    injector.registerValue(BUN_CONFIG, config);

    // Register Storage singleton
    injector.register({
        provide: StorageService,
        useClass: StorageService,
        scope: "singleton",
    });

    // Register Multi-Providers for Plugins
    injector.register({
        provide: PLUGIN_TOKEN,
        useClass: LoggingPlugin,
        multi: true,
        scope: "singleton",
    });

    injector.register({
        provide: PLUGIN_TOKEN,
        useClass: MetricsPlugin,
        multi: true,
        scope: "singleton",
    });

    // Refresh decorated classes into container
    injector.refresh();

    // Initialize container
    await injector.initialize();

    return injector;
}

export async function handleApiRequest(injector: Injector, action: string, payload: any) {
    return injector.runInScope(async () => {
        const apiService = injector.get(ApiService);
        const plugins = injector.getAll<AppPlugin>(PLUGIN_TOKEN);
        return apiService.execute(action, payload, plugins);
    });
}
