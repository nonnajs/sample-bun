import {Injectable, OnDestroy} from "@nonnajs/di";

@Injectable()
export class StorageService implements OnDestroy {
    private readonly store = new Map<string, unknown>();
    public isDestroyed = false;

    set(key: string, value: unknown): void {
        this.store.set(key, value);
    }

    get<T = unknown>(key: string): T | undefined {
        return this.store.get(key) as T | undefined;
    }

    onDestroy(): void {
        this.isDestroyed = true;
        this.store.clear();
    }
}
