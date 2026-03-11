import crypto from 'crypto';

export function hashError(errorText: string): string {
    // Normalize error text: lowercase, remove extra whitespace, remove timestamps/line numbers (rudimentary)
    const normalized = errorText
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
        
    return crypto.createHash('sha256').update(normalized).digest('hex');
}
