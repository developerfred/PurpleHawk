import { config } from "../config";

export class PowerUserService {
    private powerUsers: Set<number>;
    private lastUpdate: number;
    private updating: boolean;

    constructor() {
        this.powerUsers = new Set();
        this.lastUpdate = 0;
        this.updating = false;
    }

    private async fetchPowerUsers(): Promise<void> {
        try {
            const response = await fetch(
                `${config.NEYNAR_API_URL}/v2/farcaster/user/power_lite`,
                {
                    headers: {
                        'accept': 'application/json',
                        'x-api-key': config.NEYNAR_API_KEY,
                        'x-neynar-experimental': 'true'
                    }
                }
            );

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            this.powerUsers = new Set(data.result.fids);
            this.lastUpdate = Date.now();
            this.updating = false;
        } catch (error) {
            console.error('[Farcaster] Error fetching power users:', error);
            this.updating = false;
        }
    }

    async isPowerUser(fid: number): Promise<boolean> {
        if (Date.now() - this.lastUpdate > 3600000 && !this.updating) {
            this.updating = true;
            this.fetchPowerUsers();
        }
        return this.powerUsers.has(fid);
    }
}