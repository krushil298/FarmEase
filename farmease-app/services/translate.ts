/**
 * Translation service — powered by MyMemory NLP Translation API.
 *
 * Calls https://api.mymemory.translated.net directly from the app.
 * No backend required. Free up to 5000 words/day.
 * Supports all Indian regional languages (hi, ta, te, kn, mr, bn, gu, pa, ml, or).
 *
 * In-memory cache ensures each string is only translated once per session.
 */

// In-memory cache: { "hi:Hello" -> "नमस्ते" }
const cache: Record<string, string> = {};

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const GOOGLE_URL = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en';

// Map our short codes to standard locales for APIs
const LOCALE_MAP: Record<string, string> = {
    hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN', kn: 'kn-IN', mr: 'mr-IN',
    bn: 'bn-IN', gu: 'gu-IN', pa: 'pa-IN', ml: 'ml-IN', or: 'or-IN'
};

function cacheKey(lang: string, text: string): string {
    return `${lang}:${text}`;
}

/**
 * Primary translation using MyMemory.
 */
async function fetchMyMemory(text: string, targetLang: string): Promise<string | null> {
    try {
        const locale = LOCALE_MAP[targetLang] || targetLang;
        const params = new URLSearchParams({
            q: text,
            langpair: `en|${locale}`,
            de: 'lohiya.krushil@gmail.com'
        });

        const res = await fetch(`${MYMEMORY_URL}?${params.toString()}`, { method: 'GET' });
        if (!res.ok) return null;

        const data = await res.json();
        const translated = data?.responseData?.translatedText;

        if (!translated || translated.toUpperCase().includes('EXCEEDED') || translated === locale) {
            return null;
        }
        return translated;
    } catch {
        return null;
    }
}

/**
 * Fallback translation using Google (Free gtx endpoint).
 */
async function fetchGoogle(text: string, targetLang: string): Promise<string | null> {
    try {
        const url = `${GOOGLE_URL}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) return null;

        const data = await res.json();
        const translated = data?.[0]?.[0]?.[0];
        return translated || null;
    } catch {
        return null;
    }
}

/**
 * Translate a single string with multiple failovers.
 */
async function translateSingle(text: string, targetLang: string): Promise<string> {
    if (!text?.trim() || targetLang === 'en') return text;

    const key = cacheKey(targetLang, text);
    if (cache[key]) return cache[key];

    // Priority 1: Google (More stable for mobile gtx endpoint)
    let result = await fetchGoogle(text, targetLang);

    // Priority 2: MyMemory fallback
    if (!result) {
        result = await fetchMyMemory(text, targetLang);
    }

    if (result && result !== text) {
        console.log(`[Translate] OK (${targetLang}): "${text.substring(0, 10)}..." -> "${result.substring(0, 10)}..."`);
        cache[key] = result;
        return result;
    }

    return text;
}

/**
 * Translate a batch of English strings to the target language.
 */
export async function translateBatch(
    texts: string[],
    targetLang: string
): Promise<string[]> {
    if (targetLang === 'en' || !texts.length) return texts;

    console.log(`[Translate] Batch: ${texts.length} strings to ${targetLang}`);

    const results: string[] = [];
    for (const text of texts) {
        const res = await translateSingle(text, targetLang);
        results.push(res);
        // Small delay to maintain stability
        await new Promise(r => setTimeout(r, 30));
    }

    return results;
}

export async function translateOne(text: string, targetLang: string): Promise<string> {
    return translateSingle(text, targetLang);
}
