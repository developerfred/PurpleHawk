import './styles.css';
import { NameResolver } from './services/nameResolver';
import { CachedName, TextTriggerPattern, RegexTriggerPattern, TriggerPattern } from './types';

const resolver = new NameResolver();

const log = {
    info: (message: string, ...args: any[]) => {
        console.log(`%c[Farcaster]%c ${message}`, 'color: #855DCD; font-weight: bold;', '', ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`%c[Farcaster]%c ${message}`, 'color: #ff4444; font-weight: bold;', '', ...args);
    }
};

const ADDRESS_PATTERNS = {
    // Complete address in explorer URLs
    EXPLORER_URL: /\/address\/(0x[a-fA-F0-9]{40})/i,
    // Shortened address (0x1...234)
    SHORTENED: /^0x[a-fA-F0-9]{1,3}\.{3}[a-fA-F0-9]{3}$/i,
    // Full address
    FULL: /0x[a-fA-F0-9]{40}/i,
    // Last characters only (123abc)
    LAST_CHARS: /^[a-fA-F0-9]{6}$/i
};

interface AddressInfo {
    fullAddress: string;
    element: Element;
    displayText: string;
}

function extractAddressFromExplorerUrl(url: string): string | null {
    const match = url.match(ADDRESS_PATTERNS.EXPLORER_URL);
    return match ? match[1].toLowerCase() : null;
}

function findTextNodesWithAddresses(element: Element): Text[] {
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                const text = node.textContent?.trim() || '';
                return (ADDRESS_PATTERNS.SHORTENED.test(text) ||
                    ADDRESS_PATTERNS.FULL.test(text) ||
                    ADDRESS_PATTERNS.LAST_CHARS.test(text))
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT;
            }
        }
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node as Text);
    }
    return textNodes;
}

function findAddressMappings(): AddressInfo[] {
    const mappings: AddressInfo[] = [];
    const processed = new Set<string>();

    try {
        const explorerLinks = Array.from(document.querySelectorAll('a[href*="/address/0x"]'));

        for (const link of explorerLinks) {
            const href = link.getAttribute('href');
            if (!href) continue;

            const fullAddress = extractAddressFromExplorerUrl(href);
            if (!fullAddress) continue;

            // Search parent elements for shortened addresses
            const parentElement = link.closest('tr') || link.closest('div');
            if (!parentElement) continue;

            const textNodes = findTextNodesWithAddresses(parentElement);

            for (const textNode of textNodes) {
                const text = textNode.textContent?.trim() || '';
                const elementKey = `${fullAddress}-${text}`;

                if (processed.has(elementKey)) continue;

                // Process only if it matches our criteria
                if (ADDRESS_PATTERNS.SHORTENED.test(text) ||
                    text.toLowerCase() === fullAddress.slice(-6)) {

                    let element = textNode.parentElement;
                    if (!element) continue;

                    mappings.push({
                        fullAddress,
                        element,
                        displayText: text
                    });

                    processed.add(elementKey);

                    log.info('Found address mapping:', {
                        text,
                        fullAddress,
                        elementType: element.tagName
                    });
                }
            }
        }

        return mappings;
    } catch (error) {
        log.error('Error finding addresses:', error);
        return [];
    }
}

function createNameElement(cachedName: CachedName, originalAddress: string): HTMLSpanElement {
    const container = document.createElement('span');
    container.className = `fc-name fc-name-${cachedName.type}`;
    container.dataset.address = originalAddress;

    if (cachedName.type === 'farcaster') {
        const link = document.createElement('a');
        link.href = `https://warpcast.com/${cachedName.name}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'fc-name-link';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = cachedName.displayName || cachedName.name;
        link.appendChild(nameSpan);

        container.appendChild(link);
    } else {
        container.textContent = cachedName.displayName || cachedName.name;
    }

    return container;
}

async function processAddressMapping(mapping: AddressInfo): Promise<void> {
    try {
        if (mapping.element.classList.contains('fc-processed')) return;

        const resolvedName = await resolver.resolveName(mapping.fullAddress);
        if (!resolvedName) return;

        const nameElement = createNameElement(resolvedName, mapping.fullAddress);
        mapping.element.classList.add('fc-processed');

        // Handle DOM replacement while preserving structure
        if (mapping.element.childNodes.length === 1 && mapping.element.firstChild?.nodeType === Node.TEXT_NODE) {
            mapping.element.replaceWith(nameElement);
        } else {
            mapping.element.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === mapping.displayText) {
                    node.replaceWith(nameElement);
                }
            });
        }

        log.info('Replaced address with name:', {
            from: mapping.displayText,
            to: resolvedName.name
        });
    } catch (error) {
        log.error('Error processing address:', error);
    }
}

const TRIGGER_PATTERNS: TriggerPattern[] = [
    {
        texts: ['Transactions', 'Top Traders', 'Holders', 'Liquidity Providers'],
        selector: 'span, button, div'
    },
    {
        regex: /Holders\s*\(\d+\)/,
        selector: 'button'
    },
    {
        regex: /Liquidity Providers\s*\(\d+\)/,
        selector: 'button'
    }
];

function checkForTriggers(): boolean {
    try {
        // Check exact text matches
        for (const pattern of TRIGGER_PATTERNS) {
            if ('texts' in pattern) {
                const elements = Array.from(document.querySelectorAll(pattern.selector));
                const found = elements.some(el => {
                    const text = el.textContent?.trim() || '';
                    return pattern.texts.some(triggerText => text.includes(triggerText));
                });

                if (found) {
                    log.info('Trigger found with text pattern');
                    return true;
                }
            }
            // Check regex patterns
            if ('regex' in pattern) {
                const elements = Array.from(document.querySelectorAll(pattern.selector));
                const found = elements.some(el => {
                    const text = el.textContent?.trim() || '';
                    return pattern.regex.test(text);
                });

                if (found) {
                    log.info('Trigger found with regex pattern');
                    return true;
                }
            }
        }

        // Check for specific SVGs indicating relevant sections
        const svgPaths = [
            'M4.87759 3.00293H19.1319C19.4518',
            'M562.1 383.9c-21.5-2.4-42.1-10.5'
        ];

        const svgs = document.querySelectorAll('svg');
        for (const svg of svgs) {
            const paths = svg.querySelectorAll('path');
            for (const path of paths) {
                const d = path.getAttribute('d');
                if (d && svgPaths.some(p => d.startsWith(p))) {
                    log.info('Trigger found through SVG icon');
                    return true;
                }
            }
        }

        return false;
    } catch (error) {
        log.error('Error checking triggers:', error);
        return false;
    }
}

function debounce<T extends (...args: any[]) => any>(
    fn: T,
    ms: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;

    return function (this: any, ...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), ms);
    };
}

function initialize() {
    if (!checkForTriggers()) {
        log.info('No relevant triggers found, extension not initialized');
        return;
    }

    log.info('Triggers found, initializing Farcaster extension');

    const process = debounce(() => {
        const mappings = findAddressMappings();
        mappings.forEach(processAddressMapping);
    }, 100);

    // Initial processing
    process();

    const observer = new MutationObserver((mutations) => {
        if (checkForTriggers()) {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    process();
                    break;
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    log.info('Extension initialized successfully');
}

function startWithRetry(maxRetries = 10) {
    let attempts = 0;
    const intervals = [100, 200, 300, 500, 1000, 2000];

    const tryInitialize = () => {
        if (attempts >= maxRetries) {
            log.error('Failed to initialize after maximum retries');
            return;
        }

        if (document.readyState === 'complete') {
            if (checkForTriggers()) {
                initialize();
                log.info('Extension initialized on attempt', attempts + 1);
            } else {
                attempts++;
                const interval = intervals[Math.min(attempts, intervals.length - 1)];
                log.info(`No triggers found, retrying in ${interval}ms (attempt ${attempts + 1})`);
                setTimeout(tryInitialize, interval);
            }
        } else {
            window.addEventListener('load', tryInitialize);
        }
    };

    tryInitialize();
}

const styles = `
.fc-name {
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.fc-name-farcaster {
    color: #855DCD;
}

.fc-name-link {
    color: inherit;
    text-decoration: none;
}

.fc-name-link:hover {
    text-decoration: underline;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);


startWithRetry();