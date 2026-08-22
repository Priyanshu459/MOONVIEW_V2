import { history } from '../../RootAppRouter';
import { MoonviewNav } from './MoonviewNav';
import '../../styles/moonview.scss';

class MoonviewShellManager {
    constructor() {
        this.navInstance = null;
        this.navContainer = null;
        
        document.addEventListener('viewshow', this.onViewChange.bind(this));
    }

    init() {
        this.ensureNavExists();
        this.onViewChange(); // trigger for initial load
    }

    ensureNavExists() {
        if (!this.navContainer) {
            this.navContainer = document.createElement('div');
            this.navContainer.className = 'moonview-nav-wrapper';
            document.body.appendChild(this.navContainer);
        }

        if (this.navContainer && !this.navInstance) {
            this.navInstance = new MoonviewNav(this.navContainer);
            this.navInstance.render();
        }
    }

    onViewChange() {
        const path = (history.location.pathname || '').toLowerCase();
        
        const isPlayer = path.startsWith('/video');
        const isViewer = path.startsWith('/home') || 
                         path.startsWith('/movies') || 
                         path.startsWith('/tv') || 
                         path.startsWith('/search') || 
                         path.startsWith('/details') ||
                         path.startsWith('/list');

        const skinHeader = document.querySelector('.skinHeader');
        if (!skinHeader) return;

        const headerTop = skinHeader.querySelector('.headerTop');
        
        // 1. Player Route - Hide everything
        if (isPlayer) {
            if (this.navContainer) this.navContainer.classList.add('hide');
            if (headerTop) headerTop.classList.add('hide');
            document.body.classList.add('hideMainDrawer');
            document.body.classList.remove('moonview-viewer-mode');
            return;
        }

        // 2. Viewer Routes - Moonview shell
        if (isViewer) {
            this.ensureNavExists();
            if (this.navContainer) this.navContainer.classList.remove('hide');
            if (headerTop) headerTop.classList.add('hide');
            document.body.classList.add('hideMainDrawer');
            document.body.classList.add('moonview-viewer-mode');
            
            // Clean up old injection if someone re-rendered the header
            this.removeDuplicateNavs();
            return;
        }

        // 3. Admin / Other Routes - Default Jellyfin shell
        if (this.navContainer) this.navContainer.classList.add('hide');
        if (headerTop) headerTop.classList.remove('hide');
        document.body.classList.remove('hideMainDrawer');
        document.body.classList.remove('moonview-viewer-mode');
    }

    removeDuplicateNavs() {
        const wrappers = document.querySelectorAll('.moonview-nav-wrapper');
        if (wrappers.length > 1) {
            for (let i = 1; i < wrappers.length; i++) {
                wrappers[i].remove();
            }
        }
    }
}

export const moonviewShellManager = new MoonviewShellManager();
