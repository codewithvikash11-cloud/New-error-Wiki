export function isValidErrorInput(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    
    const trimmed = input.trim();
    if (trimmed.length < 10) return false;

    // Reject basic natural language questions that don't look like errors
    const isQuestion = /^(how|what|why|where|when|who)\s/i.test(trimmed) && trimmed.endsWith('?');
    
    const errorKeywords = [
        'Error',
        'Exception',
        'Traceback',
        'TypeError',
        'ReferenceError',
        'SyntaxError',
        'ERR!',
        'fatal'
    ];

    const containsKeyword = errorKeywords.some(keyword => 
        trimmed.toLowerCase().includes(keyword.toLowerCase())
    );

    // If it's a question and lacks error keywords, reject it
    if (isQuestion && !containsKeyword) return false;

    return true; // Accepted based on loose heuristics
}
