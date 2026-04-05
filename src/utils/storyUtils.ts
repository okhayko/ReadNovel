import { Chapter } from '../types';

export function extractChapterNumber(line: string): number | null {
    const regex = /(?:Chương|Chapter|第|Quyển|Hồi|Tập)\s*(\d+)/gi;
    let match;
    const matches: { text: string; number: number; index: number }[] = [];
    while ((match = regex.exec(line)) !== null) {
        matches.push({
            text: match[0],
            number: parseInt(match[1], 10),
            index: match.index
        });
    }
    
    if (matches.length === 0) return null;
    if (matches.length === 1) return matches[0].number;
    
    const eqRegex = /={3,}/g;
    let eqMatch;
    const eqPositions: { start: number; end: number }[] = [];
    while ((eqMatch = eqRegex.exec(line)) !== null) {
        eqPositions.push({ start: eqMatch.index, end: eqMatch.index + eqMatch[0].length });
    }
    
    let bestMatch = matches[0];
    if (eqPositions.length > 0) {
        let minDistance = Infinity;
        for (const m of matches) {
            for (const eq of eqPositions) {
                let distance = Infinity;
                if (m.index >= eq.end) {
                    distance = m.index - eq.end;
                } else if (eq.start >= m.index + m.text.length) {
                    distance = eq.start - (m.index + m.text.length);
                } else {
                    distance = 0;
                }
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = m;
                }
            }
        }
    }
    return bestMatch.number;
}

export function parseAndSortChapters(content: string): Chapter[] {
    // More inclusive regex for chapter markers
    const chapterMarkerRegex = /^\s*(?:[-=]{1,}\s*)?(?:Chương|Chapter|第|Quyển|Hồi|Tập)\s*\d+.*$/gim;
    let matches = [...content.matchAll(chapterMarkerRegex)];
    
    // Fallback: if no chapters found with strict regex, try a more lenient one
    if (matches.length === 0) {
        // Lenient regex: any line that contains "Chương" or "Chapter" followed by a number, 
        // even if not at the start of the line or with other characters
        const lenientRegex = /(?:Chương|Chapter|第|Quyển|Hồi|Tập)\s*\d+/gi;
        matches = [...content.matchAll(lenientRegex)];
    }

    let parsedChapters: Chapter[] = [];

    if (matches.length === 0) {
        parsedChapters.push({ title: 'Toàn bộ nội dung', content: content });
    } else {
        if (matches[0].index > 0) {
            const prelude = content.substring(0, matches[0].index).trim();
            if (prelude) parsedChapters.push({ title: 'Mở đầu', content: prelude, chapterNumber: -1 });
        }
        matches.forEach((match, i) => {
            const rawTitle = match[0].trim();
            // Clean title: remove leading/trailing decorative characters like === or ---
            const title = rawTitle.replace(/^[\s\-=]+|[\s\-=]+$/g, '').trim();
            
            const contentStartIndex = match.index + match[0].length;
            const contentEndIndex = (i + 1 < matches.length) ? matches[i+1].index : content.length;
            let chapterContent = content.substring(contentStartIndex, contentEndIndex).trim();
            chapterContent = chapterContent.replace(/(?:\n\n---\n\n|\n---|\n\n---)$/, '').trim();
            const chapterNumber = extractChapterNumber(rawTitle) ?? i;
            parsedChapters.push({ title: title, content: chapterContent, chapterNumber });
        });
    }
    
    if (parsedChapters.length > 1 && parsedChapters.some(c => c.chapterNumber !== undefined)) {
        parsedChapters.sort((a, b) => {
            if (a.chapterNumber === undefined && b.chapterNumber === undefined) return 0;
            if (a.chapterNumber === undefined) return 1;
            if (b.chapterNumber === undefined) return -1;
            return a.chapterNumber - b.chapterNumber;
        });
    }
    
    return parsedChapters;
}
