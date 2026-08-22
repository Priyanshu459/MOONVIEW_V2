import globalize from 'lib/globalize';
import Dashboard from 'utils/dashboard';
import { ServerConnections } from 'lib/jellyfin-apiclient';

import './MoonviewProfileMenu.scss';

export class MoonviewProfileMenu {
    constructor() {
        this.apiClient = ServerConnections.currentApiClient();
        this.menuElement = null;
        this.isOpen = false;
        
        this.handleDocumentClick = this.handleDocumentClick.bind(this);
    }

    async render(container) {
        if (this.menuElement) {
            this.menuElement.remove();
        }

        this.menuElement = document.createElement('div');
        this.menuElement.className = 'moonview-profile-menu';
        container.appendChild(this.menuElement);

        let user = null;
        try {
            user = await Dashboard.getCurrentUser();
        } catch (err) {
            console.error('[MoonviewProfileMenu] Error getting user', err);
            user = {};
        }
        const isAdmin = user.Policy && user.Policy.IsAdministrator;

        let adminOptionHtml = '';
        if (isAdmin) {
            adminOptionHtml = `
                <li class="moonview-profile-menu-divider"></li>
                <li>
                    <button class="moonview-profile-menu-item" data-action="admin">
                        <span class="material-icons dashboard" aria-hidden="true"></span>
                        <span>${globalize.translate('TabDashboard') || 'Admin Dashboard'}</span>
                    </button>
                </li>
            `;
        }

        this.menuElement.innerHTML = `
            <ul>
                <li>
                    <button class="moonview-profile-menu-item" data-action="profile">
                        <span class="material-icons person" aria-hidden="true"></span>
                        <span>Profile</span>
                    </button>
                </li>
                <li>
                    <button class="moonview-profile-menu-item" data-action="playback">
                        <span class="material-icons play_circle_outline" aria-hidden="true"></span>
                        <span>Playback Preferences</span>
                    </button>
                </li>
                ${adminOptionHtml}
                <li class="moonview-profile-menu-divider"></li>
                <li>
                    <button class="moonview-profile-menu-item" data-action="logout">
                        <span class="material-icons exit_to_app" aria-hidden="true"></span>
                        <span>Sign Out</span>
                    </button>
                </li>
            </ul>
        `;

        console.log('[MoonviewProfileMenu] Rendered menu html');
        this.attachEvents();
    }

    attachEvents() {
        if (!this.menuElement) {
            console.error('[MoonviewProfileMenu] No menu element to attach events to');
            return;
        }

        this.menuElement.querySelector('[data-action="profile"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
            Dashboard.navigate('mypreferencesmenu');
        });

        this.menuElement.querySelector('[data-action="playback"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
            Dashboard.navigate('mypreferencesmenu?tab=1');
        });

        this.menuElement.querySelector('[data-action="admin"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
            Dashboard.navigate('dashboard');
        });

        this.menuElement.querySelector('[data-action="logout"]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
            Dashboard.logout();
        });
    }

    toggle() {
        console.log('[MoonviewProfileMenu] Toggle called. isOpen:', this.isOpen);
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.menuElement) {
            console.error('[MoonviewProfileMenu] Cannot open, menuElement is null');
            return;
        }
        console.log('[MoonviewProfileMenu] Opening menu');
        this.isOpen = true;
        this.menuElement.classList.add('active');
        
        setTimeout(() => {
            document.addEventListener('click', this.handleDocumentClick);
        }, 10);
    }

    close() {
        if (!this.menuElement) return;
        console.log('[MoonviewProfileMenu] Closing menu');
        this.isOpen = false;
        this.menuElement.classList.remove('active');
        document.removeEventListener('click', this.handleDocumentClick);
    }

    handleDocumentClick(e) {
        if (this.menuElement && !this.menuElement.contains(e.target)) {
            this.close();
        }
    }

    destroy() {
        this.close();
        if (this.menuElement) {
            this.menuElement.remove();
            this.menuElement = null;
        }
    }
}
