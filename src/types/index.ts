export interface NeynarUser {
    object: 'user';
    fid: number;
    username: string;
    display_name: string;
    custody_address: string;
    pfp_url: string;
    verified_addresses: {
        eth_addresses: string[];
        sol_addresses: string[];
    };
}

export interface NeynarResponse {
    [address: string]: NeynarUser[];
}

export interface CachedName {
    name: string;
    displayName?: string;
    pfp?: string;
    type: 'farcaster' | 'ens' | 'base';
    timestamp: number;
    fid?: number;
    isPowerUser?: boolean;
    notFound?: boolean;
}

export interface TextTriggerPattern {
    texts: string[];
    selector: string;
}

export interface RegexTriggerPattern {
    regex: RegExp;
    selector: string;
}

export type TriggerPattern = TextTriggerPattern | RegexTriggerPattern;