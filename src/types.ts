
export interface CustomFont {
  name: string;
  dataUrl: string;
}

export interface ReaderSettings {
    fontSizeIndex: number;
    lineHeightIndex: number;
    fontFamily: string;
    titleFontFamily?: string;
    containerWidthIndex: number;
    containerWidth?: number;
    paragraphSpacingIndex: number;
    beautifyDialogue: boolean;
    dialoguePreset?: 'modern' | 'classic';
    themeColor?: string;
    bubbleTextColor: string;
    bubbleOffset: number;
    backgroundColor: string;
    recentColors?: string[];
}

export interface ReadState {
  storyId?: string;
  storyName?: string;
  readerText: string;
  fileName: string;
  settings: ReaderSettings;
  readerChapters: Chapter[];
  currentReaderChapterIndex: number;
}

export interface SavedStoryMeta {
  id: string;
  fileName: string;
  displayName?: string;
  currentChapterIndex: number;
  totalChapters: number;
  wordCount: number;
  lastReadAt: number;
  driveFileId?: string;
  size?: number;
  isSynced?: boolean;
}

export interface Chapter {
  title: string;
  content: string;
  chapterNumber?: number;
}



