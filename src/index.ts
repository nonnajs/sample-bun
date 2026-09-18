import {createBunApp, handleApiRequest} from "./app";
import {StorageService} from "./storage.service";

async function main() {
    console.info("Starting Bun Injector Sample Application...");

    const injector = await createBunApp({
        appName: "NodeBoot-DI-Sample-Bun",
        version: "1.0.0",
        storagePath: "/tmp/bun-storage",
    });

    // Handle concurrent requests
    const [res1, res2] = await Promise.all([
        handleApiRequest(injector, "create-item", {name: "Widget A", price: 29.99}),
        handleApiRequest(injector, "update-stock", {name: "Widget A", quantity: 100}),
    ]);

    console.info("Response 1:", res1);
    console.info("Response 2:", res2);

    const storage = injector.get(StorageService);
    console.info("Stored Record 1:", storage.get(res1.requestId));

    // Destroy injector and cleanup lifecycle
    await injector.destroy();
    console.info("Bun application destroyed successfully.");
}

if (typeof require !== "undefined" && require.main === module) {
    main().catch(console.error);
} else if (typeof (globalThis as any).Bun !== "undefined") {
    main().catch(console.error);
}
