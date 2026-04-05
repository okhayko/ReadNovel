import React from 'react';
import { SavedStoryMeta } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';
import LibraryViewMobile from './LibraryViewMobile';
import LibraryViewDesktop from './LibraryViewDesktop';

interface LibraryViewProps {
    savedStories: SavedStoryMeta[];
    onSelectStory: (id: string) => void;
    onDeleteStory: (id: string) => void;
    onEditStoryName: (id: string, newName: string) => void;
    onTranslateStory: (id: string) => void;
    onUpload: (file: File) => void;
    onBack: () => void;
    themeColor: string;
}

const LibraryView: React.FC<LibraryViewProps> = (props) => {
    const isMobile = useIsMobile();
    return isMobile ? <LibraryViewMobile {...props} /> : <LibraryViewDesktop {...props} />;
};

export default LibraryView;
