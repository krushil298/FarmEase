/**
 * useTranslation / usePreloadTranslations
 *
 * Architecture:
 * - translationCache: shared in-memory store (lang -> { original -> translated })
 * - usePreloadTranslations: fetches all strings for a screen when language changes
 *   and forces a re-render once translations arrive
 * - t(): reads from cache synchronously — shows original text until cache is ready
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { translateBatch } from '../services/translate';
import { translations } from '../utils/i18n';

// Helper to get nested value from the English translation object
function getLiteralFromKey(key: string): string {
    if (!key.includes('.')) return key;
    const parts = key.split('.');
    let current: any = translations.en;
    for (const part of parts) {
        if (current[part] === undefined) return key;
        current = current[part];
    }
    return typeof current === 'string' ? current : key;
}

// Helper to get local hardcoded translation if available
function getHardcodedTranslation(lang: string, key: string): string | undefined {
    if (!translations[lang as keyof typeof translations]) return undefined;
    const parts = key.split('.');
    let current: any = translations[lang as keyof typeof translations];
    for (const part of parts) {
        if (current[part] === undefined) return undefined;
        current = current[part];
    }
    return typeof current === 'string' ? current : undefined;
}

// Shared per-language cache across all components
const translationCache: Record<string, Record<string, string>> = {};

// Listeners notified when a language's cache is updated
type CacheListener = () => void;
const cacheListeners = new Set<CacheListener>();

function notifyCacheUpdated() {
    cacheListeners.forEach((fn) => fn());
}

export function useTranslation() {
    const { language } = useLanguageStore();

    // Subscribe to cache updates so t() returns fresh values after fetch
    const [, setTick] = useState(0);

    useEffect(() => {
        const listener: CacheListener = () => setTick((n) => n + 1);
        cacheListeners.add(listener);
        return () => { cacheListeners.delete(listener); };
    }, []);

    const t = useCallback(
        (textOrKey: string): string => {
            if (!textOrKey) return '';

            // 1. Try local hardcoded translation
            const local = getHardcodedTranslation(language, textOrKey);
            if (local) return local;

            // 2. Resolve to English literal
            const text = getLiteralFromKey(textOrKey);
            if (language === 'en') return text;

            // 3. Fallback to cache
            const cached = translationCache[language]?.[text];
            if (cached !== undefined) return cached;

            // 4. Trigger background auto-translate if not in cache (JIT translation)
            // This ensures strings not in pre-preload lists still get translated
            const currentLang = language;
            import('../services/translate').then(({ translateOne }) => {
                translateOne(text, currentLang).then(res => {
                    if (res && res !== text) {
                        if (!translationCache[currentLang]) translationCache[currentLang] = {};
                        translationCache[currentLang][text] = res;
                        notifyCacheUpdated();
                    }
                });
            });

            return text;
        },
        [language]
    );

    return { t, language };
}

/**
 * Pre-warm the translation cache for a given set of strings.
 * Call at the top of each screen with the list of strings it displays.
 *
 * Usage:
 *   const { t, isTranslating } = usePreloadTranslations(['Dashboard', 'Scan Crop']);
 */
export function usePreloadTranslations(strings: string[]) {
    const { language } = useLanguageStore();
    const [isTranslating, setIsTranslating] = useState(false);
    const prevLang = useRef<string>('');
    const prevStringsKey = useRef<string>('');

    // Subscribe to cache updates to re-render after translations arrive
    const [, setTick] = useState(0);

    useEffect(() => {
        const listener: CacheListener = () => setTick((n) => n + 1);
        cacheListeners.add(listener);
        return () => { cacheListeners.delete(listener); };
    }, []);

    useEffect(() => {
        if (language === 'en') {
            setIsTranslating(false);
            return;
        }

        const stringsKey = strings.join('||');

        // Skip if nothing changed
        if (prevLang.current === language && prevStringsKey.current === stringsKey) return;

        prevLang.current = language;
        prevStringsKey.current = stringsKey;

        // Convert keys to literals for translation, but ONLY for those NOT hardcoded
        const toFetch: string[] = [];
        const literalStrings = strings.map(s => {
            const hasLocal = !!getHardcodedTranslation(language, s);
            const literal = getLiteralFromKey(s);

            // If we don't have it locally and it's not in the sync cache, fetch it
            if (!hasLocal && (translationCache[language]?.[literal] === undefined)) {
                toFetch.push(literal);
            }
            return literal;
        });

        if (toFetch.length === 0) {
            setIsTranslating(false);
            return;
        }

        setIsTranslating(true);
        const targetLanguage = language;

        translateBatch(toFetch, targetLanguage).then((results) => {
            if (!translationCache[targetLanguage]) translationCache[targetLanguage] = {};
            toFetch.forEach((original, i) => {
                // Only cache if we actually got a translation back
                if (results[i] && results[i] !== original) {
                    translationCache[targetLanguage][original] = results[i];
                }
            });
            setIsTranslating(false);
            notifyCacheUpdated();
        }).catch(err => {
            console.error(`[usePreloadTranslations] Fetch failed:`, err);
            setIsTranslating(false);
        });
    }, [language, strings]);

    const t = useCallback(
        (textOrKey: string): string => {
            if (!textOrKey) return '';

            // 1. Try local first
            const local = getHardcodedTranslation(language, textOrKey);
            if (local) return local;

            // 2. Resolve to literal
            const text = getLiteralFromKey(textOrKey);
            if (language === 'en') return text;

            // 3. Cache
            return translationCache[language]?.[text] ?? text;
        },
        [language]
    );

    return { t, isTranslating, language };
}
