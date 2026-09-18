import assert from "node:assert/strict";
import {describe, it} from "node:test";

import {createBunApp, handleApiRequest} from "../src/app";
import {AppPlugin, PLUGIN_TOKEN} from "../src/plugin.interface";
import {BunRequestContext} from "../src/request-context";
import {StorageService} from "../src/storage.service";

describe("Sample Bun App - @nonnajs/di", () => {
    it("resolves multi-provider plugins in registration order", async () => {
        const injector = await createBunApp({
            appName: "TestBunApp",
            version: "0.1.0",
            storagePath: ":memory:",
        });

        const plugins = injector.getAll<AppPlugin>(PLUGIN_TOKEN);
        assert.equal(plugins.length, 2);
        assert.equal(plugins[0]?.name, "LoggingPlugin");
        assert.equal(plugins[1]?.name, "MetricsPlugin");

        await injector.destroy();
    });

    it("executes requests in isolated request scopes with plugin interception", async () => {
        const injector = await createBunApp({
            appName: "TestBunApp",
            version: "0.1.0",
            storagePath: ":memory:",
        });

        const [r1, r2] = await Promise.all([
            handleApiRequest(injector, "add-user", {userId: "u100"}),
            handleApiRequest(injector, "delete-user", {userId: "u100"}),
        ]);

        assert.notEqual(r1.requestId, r2.requestId, "Request IDs must differ");
        assert.equal(r1.action, "add-user");
        assert.equal(r2.action, "delete-user");

        // Verify storage persisted request data
        const storage = injector.get(StorageService);
        assert.deepEqual(storage.get(r1.requestId), r1);
        assert.deepEqual(storage.get(r2.requestId), r2);

        // Outside request scope, BunRequestContext cannot be resolved
        assert.throws(() => injector.get(BunRequestContext));

        await injector.destroy();
    });

    it("clears storage and runs onDestroy lifecycle hook on destroy()", async () => {
        const injector = await createBunApp({
            appName: "TestBunApp",
            version: "0.1.0",
            storagePath: ":memory:",
        });

        const res = await handleApiRequest(injector, "create-record", {id: 1});
        const storage = injector.get(StorageService);

        assert.ok(storage.get(res.requestId));
        assert.equal(storage.isDestroyed, false);

        await injector.destroy();

        assert.equal(storage.isDestroyed, true);
        assert.equal(storage.get(res.requestId), undefined);
    });
});
