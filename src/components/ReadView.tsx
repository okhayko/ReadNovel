import React from 'react';
import { ReadState, CustomFont } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';
import ReadViewMobile from './ReadViewMobile';
import ReadViewDesktop from './ReadViewDesktop';

interface ReadViewProps {
    readState: ReadState;
    setReadState: React.Dispatch<React.SetStateAction<ReadState>>;
    customFonts: CustomFont[];
    setCustomFonts: React.Dispatch<React.SetStateAction<CustomFont[]>>;
    onBack: () => void;
}

const ReadView: React.FC<ReadViewProps> = (props) => {
    const isMobile = useIsMobile();
    return isMobile ? <ReadViewMobile {...props} /> : <ReadViewDesktop {...props} />;
};

export default ReadView;
