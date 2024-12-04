import { NeynarUser, NeynarResponse, CachedName } from '../types';
import { config } from '../config';

export class NameResolver {
    private cache: Map<string, CachedName>;
    private pendingBatch: Set<string>;
    private batchTimeout: ReturnType<typeof setTimeout> | null;

    constructor() {
        this.cache = new Map();
        this.pendingBatch = new Set();
        this.batchTimeout = null;
        console.log('[Farcaster] Resolver initialized');
    }

    private async batchFetchFarcasterNames(addresses: string[]): Promise<Map<string, NeynarUser>> {
        try {
            console.log('[Farcaster] Fetching names for addresses:', addresses);

            const response = await fetch(
                `${config.NEYNAR_API_URL}/v2/farcaster/user/bulk-by-address?addresses=${addresses.join(',')}`,
                {
                    headers: {
                        'accept': 'application/json',
                        'x-api-key': config.NEYNAR_API_KEY,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Neynar API error: ${response.status}`);
            }

            const data: NeynarResponse = await response.json();
            console.log('[Farcaster] API response:', data);

            const userMap = new Map<string, NeynarUser>();

            Object.entries(data).forEach(([address, users]) => {
                if (users.length > 0) {
                    const normalizedAddress = address.toLowerCase();
                    userMap.set(normalizedAddress, users[0]);
                    console.log(`[Farcaster] Mapped ${normalizedAddress} to`, users[0].username);

                    // Map verified addresses
                    users[0].verified_addresses.eth_addresses.forEach(ethAddr => {
                        const normalizedEthAddr = ethAddr.toLowerCase();
                        userMap.set(normalizedEthAddr, users[0]);
                        console.log(`[Farcaster] Mapped verified address ${normalizedEthAddr} to`, users[0].username);
                    });
                }
            });

            return userMap;
        } catch (error) {
            console.error('[Farcaster] Error fetching names:', error);
            return new Map();
        }
    }

    async resolveName(address: string): Promise<CachedName | null> {
        address = address.toLowerCase();
        console.log('[Farcaster] Resolving name for:', address);

        // Check cache
        const cached = this.cache.get(address);
        if (cached && Date.now() - cached.timestamp < config.CACHE_DURATION) {
            console.log('[Farcaster] Cache hit for:', address, cached);
            return cached;
        }

        
        this.pendingBatch.add(address);
        console.log('[Farcaster] Added to pending batch:', address);

        // Process batch
        if (!this.batchTimeout) {
            this.batchTimeout = setTimeout(async () => {
                const addresses = Array.from(this.pendingBatch);
                this.pendingBatch.clear();
                this.batchTimeout = null;

                console.log('[Farcaster] Processing batch:', addresses);
                const userMap = await this.batchFetchFarcasterNames(addresses);

                for (const addr of addresses) {
                    const user = userMap.get(addr);
                    if (user) {
                        const cacheEntry = {
                            name: user.username,
                            displayName: user.display_name,
                            pfp: user.pfp_url,
                            type: 'farcaster' as const,
                            timestamp: Date.now()
                        };
                        this.cache.set(addr, cacheEntry);
                        console.log(`[Farcaster] Cached result for ${addr}:`, cacheEntry);
                    }
                }
            }, 100);
        }

        // Wait for batch processing
        return new Promise((resolve) => {
            const checkTimeout = setTimeout(async () => {
                const result = this.cache.get(address);
                if (result) {
                    console.log('[Farcaster] Resolved name:', result);
                    resolve(result);
                } else {
                    console.log('[Farcaster] No result found for:', address);
                    resolve(null);
                }
            }, 150);

            return () => clearTimeout(checkTimeout);
        });
    }
}