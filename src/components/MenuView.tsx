import React from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import MenuViewMobile from './MenuViewMobile';
import MenuViewDesktop from './MenuViewDesktop';

interface MenuViewProps {
    onNavigateRead: () => void;
    themeColor?: string;
}

const MenuView: React.FC<MenuViewProps> = (props) => {
    const isMobile = useIsMobile();
    return isMobile ? <MenuViewMobile {...props} /> : <MenuViewDesktop {...props} />;
};

export default MenuView;
