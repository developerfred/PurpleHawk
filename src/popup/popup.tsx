import React, { useEffect, useState } from 'react';
import { RotateCw, Joystick, Coffee, Heart, Settings } from 'lucide-react';


interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

interface CardProps {
    children: React.ReactNode;
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

interface CardContentProps {
    children: React.ReactNode;
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

interface ExtensionStats {
    cacheSize: number;
    lastUpdate: string;
    isEnabled: boolean;
}


const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange }) => (
    <button
        onClick={() => onCheckedChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-200'}`}
    >
        <div className={`w-5 h-5 rounded-full bg-white transform transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
);

const Card: React.FC<CardProps> = ({ children }) => (
    <div className="bg-white rounded-lg border shadow-sm">{children}</div>
);

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
    <div className={`p-4 ${className}`}>{children}</div>
);

const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
    <h3 className={`font-semibold ${className}`}>{children}</h3>
);

const CardContent: React.FC<CardContentProps> = ({ children }) => (
    <div className="p-4 pt-0">{children}</div>
);


interface ExtensionStats {
    cacheSize: number;
    lastUpdate: string;
    isEnabled: boolean;
}

interface StorageChanges {
    [key: string]: chrome.storage.StorageChange;
}

const Popup: React.FC = () => {
    const [stats, setStats] = useState<ExtensionStats>({
        cacheSize: 0,
        lastUpdate: '',
        isEnabled: true
    });
    const [activeTab, setActiveTab] = useState<'main' | 'about'>('main');

    useEffect(() => {
        void chrome.storage.local.get(['cacheSize', 'lastUpdate', 'isEnabled'], (result) => {
            setStats({
                cacheSize: result.cacheSize || 0,
                lastUpdate: result.lastUpdate || 'Never',
                isEnabled: result.isEnabled !== false
            });
        });

        const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
            setStats(prev => ({
                ...prev,
                cacheSize: changes.cacheSize?.newValue ?? prev.cacheSize,
                lastUpdate: changes.lastUpdate?.newValue ?? prev.lastUpdate,
                isEnabled: changes.isEnabled?.newValue ?? prev.isEnabled
            }));
        };

        chrome.storage.onChanged.addListener(handleStorageChange);
        return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }, []);

    const toggleExtension = () => {
        const newState = !stats.isEnabled;
        void chrome.storage.local.set({ isEnabled: newState });
        void chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (tabId) {
                void chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_EXTENSION', enabled: newState });
            }
        });
    };

    const clearCache = () => {
        void chrome.storage.local.set({ cacheSize: 0, lastUpdate: 'Never' });
        void chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0]?.id;
            if (tabId) {
                void chrome.tabs.sendMessage(tabId, { type: 'CLEAR_CACHE' });
            }
        });
    };


    return (

        <div className="w-72 p-4 space-y-4" >
            <header className="flex items-center justify-between" >
                <div className="flex items-center space-x-2" onClick={() => setActiveTab('main')}>
                    <img src="../icons/icon-32.png" alt="PurpleHawk" className="w-8 h-8" />
                    <h1 className="text-xl font-bold text-purple-600" > PurpleHawk </h1>
                </div>
                < Switch checked={stats.isEnabled} onCheckedChange={toggleExtension} />
            </header>

            {
                activeTab === 'main' ? (
                    <>
                        <Card>
                            <CardHeader className="pb-2" >
                                <CardTitle className="text-sm" > Cache Status </CardTitle>
                            </CardHeader>
                            < CardContent >
                                <div className="flex justify-between items-center" >
                                    <div className="text-sm" >
                                        <p>Cached Names: {stats.cacheSize} </p>
                                        <p> Last Update: {stats.lastUpdate} </p>
                                    </div>
                                    < button
                                        onClick={clearCache}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        < div className="space-y-2" >
                            <button
                                onClick={() => setActiveTab('about')}
                                className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                            >
                                <div className="flex items-center space-x-2" >
                                    <Settings className="w-4 h-4" />
                                    <span>About </span>
                                </div>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-4" >
                        <div className="text-center space-y-2" >
                            <h2 className="font-bold" > Created by </h2>
                            < a
                                href="https://warpcast.com/codingsh"
                                target="_blank"
                                className="text-purple-600 hover:underline flex items-center justify-center gap-2"
                            >
                                <img
                                        src="https://wrpcd.net/cdn-cgi/image/anim=false,fit=contain,f=auto,w=336/https%3A%2F%2Fi.imgur.com%2F5HxmC1P.jpg"
                                    alt="developerfred"
                                    className="w-6 h-6 rounded-full"
                                />
                                @developerfred
                            </a>
                        </div>

                        < div className="space-y-2" >
                            <a
                                href="https://Github.com/developerfred/purplehawk"
                                target="_blank"
                                className="w-full flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 rounded"
                            >
                                <Joystick className="w-4 h-4" />
                                Contribute on Github
                            </a>

                            < a
                                    href="https://etherscan.io/address/0xd1a8Dd23e356B9fAE27dF5DeF9ea025A602EC81e"
                                target="_blank"
                                className="w-full flex items-center justify-center gap-2 p-2 bg-purple-100 hover:bg-purple-200 rounded text-purple-700"
                            >
                                <Coffee className="w-4 h-4" />
                                Buy me a coffee
                            </a>
                        </div>

                        < div className="text-xs text-center text-gray-500" >
                            Made with <Heart className="w-3 h-3 inline text-red-500" /> for the Farcaster community
                        </div>
                    </div>
                )}

            <footer className="text-xs text-gray-500 text-center" >
                Version 1.0.4
            </footer>
        </div>
    );
};

export default Popup;