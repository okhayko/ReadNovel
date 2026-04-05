import React, { useState, useEffect, useRef } from 'react';
import localforage from 'localforage';
import { Chapter, SavedStoryMeta, ReadState, CustomFont } from './types';
import MenuView from './components/MenuView';
import ReadView from './components/ReadView';
import LibraryView from './components/LibraryView';
import TransitionOverlay, { TransitionOverlayHandle } from './components/TransitionOverlay';
import { parseAndSortChapters } from './utils/storyUtils';

type View = 'menu' | 'read' | 'library';

export default function App() {
  const [view, setView] = useState<View>('menu');
  const overlayRef = useRef<TransitionOverlayHandle>(null);
  const [savedStories, setSavedStories] = useState<SavedStoryMeta[]>([]);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

  const [readState, setReadState] = useState<ReadState>(() => {
    const savedSettings = localStorage.getItem('readerSettings');
    const parsedSettings = savedSettings ? JSON.parse(savedSettings) : null;
    const savedChapterIndex = localStorage.getItem('currentReaderChapterIndex');
    const defaultRecentColors = ['#F4ECD8', '#E3EDCD', '#E8E9EA', '#1B1D1E', '#000000', '#FFFFFF'];
    return {
      readerText: '',
      fileName: '',
      settings: parsedSettings ? { 
        ...parsedSettings, 
        beautifyDialogue: parsedSettings.beautifyDialogue ?? true, 
        dialoguePreset: parsedSettings.dialoguePreset ?? 'modern',
        themeColor: parsedSettings.themeColor ?? '#04DA98',
        bubbleTextColor: parsedSettings.bubbleTextColor ?? '#04DA98', 
        paragraphSpacingIndex: parsedSettings.paragraphSpacingIndex ?? 7, 
        bubbleOffset: parsedSettings.bubbleOffset ?? 0, 
        backgroundColor: parsedSettings.backgroundColor ?? '#1B1D1E',
        containerWidth: parsedSettings.containerWidth ?? (parsedSettings.containerWidthIndex !== undefined ? [700, 800, 910, 1000, 1100][parsedSettings.containerWidthIndex] : 800),
        recentColors: parsedSettings.recentColors ?? defaultRecentColors,
        titleFontFamily: parsedSettings.titleFontFamily ?? 'Texturina_48pt-Bold'
      } : {
        fontSizeIndex: 2,
        lineHeightIndex: 4,
        fontFamily: 'Oswald-Light',
        titleFontFamily: 'Texturina_48pt-Bold',
        containerWidthIndex: 2,
        containerWidth: 800,
        paragraphSpacingIndex: 7,
        beautifyDialogue: true,
        dialoguePreset: 'modern',
        themeColor: '#04DA98',
        bubbleTextColor: '#04DA98',
        bubbleOffset: 0,
        backgroundColor: '#1B1D1E',
        recentColors: defaultRecentColors
      },
      readerChapters: [],
      currentReaderChapterIndex: savedChapterIndex ? parseInt(savedChapterIndex, 10) : 0,
    };
  });

  useEffect(() => {
    localStorage.setItem('readerSettings', JSON.stringify(readState.settings));
    
    // Apply theme color to CSS variable
    if (readState.settings.themeColor) {
      document.documentElement.style.setProperty('--app-accent', readState.settings.themeColor);
      
      // Convert hex to RGB for radial gradient
      const hex = readState.settings.themeColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      document.documentElement.style.setProperty('--app-accent-rgb', `${r}, ${g}, ${b}`);
    }
  }, [readState.settings]);

  useEffect(() => {
    localStorage.setItem('currentReaderChapterIndex', readState.currentReaderChapterIndex.toString());
  }, [readState.currentReaderChapterIndex]);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const stories = await localforage.getItem<SavedStoryMeta[]>('savedStories');
        if (stories) {
          // Add wordCount to existing stories if missing
          const updatedStories = stories.map(s => ({
            ...s,
            wordCount: s.wordCount || 0
          }));
          setSavedStories(updatedStories);
        } else {
          // Migrate legacy single story if exists
          const savedFileName = await localforage.getItem<string>('fileName');
          const savedChapters = await localforage.getItem<Chapter[]>('readerChapters');
          const savedReaderText = await localforage.getItem<string>('readerText');
          const savedChapterIndex = localStorage.getItem('currentReaderChapterIndex');
          
          if (savedChapters && savedChapters.length > 0 && savedFileName && savedReaderText) {
            const legacyId = 'legacy_story';
            const legacyStory: SavedStoryMeta = {
              id: legacyId,
              fileName: savedFileName,
              currentChapterIndex: savedChapterIndex ? parseInt(savedChapterIndex, 10) : 0,
              totalChapters: savedChapters.length,
              wordCount: savedReaderText.split(/\s+/).filter(Boolean).length,
              lastReadAt: Date.now()
            };
            setSavedStories([legacyStory]);
            await localforage.setItem('savedStories', [legacyStory]);
            await localforage.setItem(`story_${legacyId}_text`, savedReaderText);
            await localforage.setItem(`story_${legacyId}_chapters`, savedChapters);
            
            // Clear legacy keys
            await localforage.removeItem('fileName');
            await localforage.removeItem('readerChapters');
            await localforage.removeItem('readerText');
            localStorage.removeItem('currentReaderChapterIndex');
          }
        }

        const fonts = await localforage.getItem<CustomFont[]>('customFonts');
        if (fonts) {
          setCustomFonts(fonts);
        }
      } catch (error) {
        console.error("Error loading saved data from localforage", error);
      }
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    if (savedStories.length > 0) {
      localforage.setItem('savedStories', savedStories);
    }
  }, [savedStories]);

  useEffect(() => {
    if (customFonts.length > 0) {
      localforage.setItem('customFonts', customFonts);
      
      const styleId = 'custom-fonts-style';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      
      const cssRules = customFonts.map(font => `
        @font-face {
          font-family: '${font.name}';
          src: url('${font.dataUrl}');
        }
      `).join('\n');
      
      styleEl.innerHTML = cssRules;
    }
  }, [customFonts]);

  useEffect(() => {
    const saveStoryData = async () => {
      if (readState.storyId && readState.readerChapters.length > 0) {
        try {
          await localforage.setItem(`story_${readState.storyId}_text`, readState.readerText);
          await localforage.setItem(`story_${readState.storyId}_chapters`, readState.readerChapters);
        } catch (error) {
          console.error("Error saving story data to localforage", error);
        }
      }
    };
    saveStoryData();
  }, [readState.storyId, readState.readerChapters, readState.readerText]);

  useEffect(() => {
    if (readState.storyId) {
      // Update metadata only
      setSavedStories(prev => prev.map(story => 
        story.id === readState.storyId 
          ? { ...story, currentChapterIndex: readState.currentReaderChapterIndex, lastReadAt: Date.now() }
          : story
      ));
    }
  }, [readState.currentReaderChapterIndex, readState.storyId]);

  useEffect(() => {
    overlayRef.current?.animateEnter();
  }, [view]);

  const navigateWithTransition = (newView: View, action?: () => void) => {
    overlayRef.current?.animateLeave(() => {
      if (action) action();
      setView(newView);
    });
  };

  const handleNavigateToLibrary = () => {
    navigateWithTransition('library');
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target?.result as string;
        const parsedChapters = parseAndSortChapters(text);
        
        const newStoryId = Date.now().toString();
        const wordCount = (text.match(/\S+/g) || []).length;
        
        const newStory: SavedStoryMeta = {
            id: newStoryId,
            fileName: file.name,
            currentChapterIndex: 0,
            totalChapters: parsedChapters.length,
            wordCount,
            lastReadAt: Date.now()
        };

        navigateWithTransition('read', () => {
          setSavedStories(prev => [newStory, ...prev]);
          setReadState(prev => ({
              ...prev,
              storyId: newStoryId,
              storyName: file.name,
              readerText: text,
              fileName: file.name,
              readerChapters: parsedChapters,
              currentReaderChapterIndex: 0
          }));
        });
    };
    reader.readAsText(file);
  };

  const handleSelectStory = async (id: string) => {
    const storyMeta = savedStories.find(s => s.id === id);
    if (!storyMeta) return;

    try {
        const text = await localforage.getItem<string>(`story_${id}_text`);
        const chapters = await localforage.getItem<Chapter[]>(`story_${id}_chapters`);

        if (text && chapters) {
            navigateWithTransition('read', () => {
              setReadState(prev => ({
                  ...prev,
                  storyId: id,
                  storyName: storyMeta.displayName || storyMeta.fileName,
                  readerText: text,
                  fileName: storyMeta.fileName,
                  readerChapters: chapters,
                  currentReaderChapterIndex: storyMeta.currentChapterIndex
              }));
            });
        }
    } catch (error) {
        console.error("Error loading story", error);
    }
  };

  const handleDeleteStory = async (id: string) => {
    setSavedStories(prev => prev.filter(s => s.id !== id));
    await localforage.removeItem(`story_${id}_text`);
    await localforage.removeItem(`story_${id}_chapters`);
    
    if (readState.storyId === id) {
        setReadState(prev => ({
            ...prev,
            storyId: undefined,
            readerText: '',
            fileName: '',
            readerChapters: [],
            currentReaderChapterIndex: 0
        }));
    }
  };

  const handleEditStoryName = (id: string, newName: string) => {
    setSavedStories(prev => prev.map(story => 
      story.id === id ? { ...story, displayName: newName } : story
    ));
  };

  const renderContent = () => {
    switch (view) {
      case 'library':
        return (
          <LibraryView 
            savedStories={savedStories}
            onSelectStory={handleSelectStory}
            onDeleteStory={handleDeleteStory}
            onEditStoryName={handleEditStoryName}
            onUpload={handleUpload}
            onBack={() => navigateWithTransition('menu')}
            themeColor={readState.settings.themeColor}
          />
        );
      case 'read':
        return (
          <ReadView 
            readState={readState}
            setReadState={setReadState}
            customFonts={customFonts}
            setCustomFonts={setCustomFonts}
            onBack={() => navigateWithTransition('library')}
          />
        );
      default:
        return <MenuView onNavigateRead={handleNavigateToLibrary} themeColor={readState.settings.themeColor} />;
    }
  };

  return (
    <div className="min-h-screen bg-app-bg font-sora relative overflow-hidden">
      {renderContent()}
      <TransitionOverlay ref={overlayRef} />
    </div>
  );
}
