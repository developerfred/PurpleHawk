export interface Config {
    NEYNAR_API_KEY: string;
    NEYNAR_API_URL: string;        
    CACHE_DURATION: number;
}

export const config: Config = {
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY || '',
    NEYNAR_API_URL: process.env.NEYNAR_API_URL || 'https://api.neynar.com',        
    CACHE_DURATION: parseInt(process.env.CACHE_DURATION || '3600000'),
};