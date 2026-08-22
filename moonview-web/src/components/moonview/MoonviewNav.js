import globalize from 'lib/globalize';
import Dashboard from 'utils/dashboard';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import { MoonviewProfileMenu } from './MoonviewProfileMenu/MoonviewProfileMenu';

import './MoonviewNav.scss';

export class MoonviewNav {
    constructor(container) {
        this.container = container;
        this.apiClient = ServerConnections.currentApiClient();
        this.navElement = null;
        this.profileMenu = new MoonviewProfileMenu();
    }

    updateActiveState() {
        if (!this.navElement) return;
        const hash = window.location.hash.toLowerCase();
        
        const links = this.navElement.querySelectorAll('.moonview-nav-link');
        links.forEach(link => link.classList.remove('active'));

        if (hash.includes('/movies')) {
            this.navElement.querySelector('[data-route="movies"]')?.classList.add('active');
        } else if (hash.includes('/tv')) {
            this.navElement.querySelector('[data-route="shows"]')?.classList.add('active');
        } else if (hash.includes('isfavorite=true')) {
            this.navElement.querySelector('[data-route="favorites"]')?.classList.add('active');
        } else if (hash.includes('/home') || hash === '' || hash === '#/') {
            this.navElement.querySelector('[data-route="home"]')?.classList.add('active');
        }
    }

    render() {
        // Build the HTML for the Netflix-style nav
        const html = `
            <div class="moonview-nav">
                <div class="moonview-nav-left">
                    <a class="moonview-nav-logo-link" href="#/home">
                        <h2 class="moonview-nav-logo-text">MOONVIEW</h2>
                    </a>
                    <ul class="moonview-nav-links">
                        <li><a href="#/home" class="moonview-nav-link" data-route="home">${globalize.translate('Home')}</a></li>
                        <li><a href="#/movies" class="moonview-nav-link" data-route="movies">${globalize.translate('Movies')}</a></li>
                        <li><a href="#/tv" class="moonview-nav-link" data-route="shows">${globalize.translate('Shows')}</a></li>
                        <li><a href="#/list?type=Programs,Movie,Series&IsFavorite=true" class="moonview-nav-link" data-route="favorites">My List</a></li>
                    </ul>
                </div>
                <div class="moonview-nav-right">
                    <button class="moonview-nav-btn moonview-nav-search" title="${globalize.translate('Search')}" aria-label="${globalize.translate('Search')}">
                        <span class="material-icons search" aria-hidden="true"></span>
                    </button>
                    <div class="moonview-nav-profile-container">
                        <button type="button" class="moonview-profile-button moonview-nav-btn" aria-label="Open profile menu" aria-expanded="false">
                            <span class="material-icons person" aria-hidden="true"></span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.navElement = this.container.querySelector('.moonview-nav');

        // Scroll listener for sticky solid background
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        
        // Search button logic
        const searchBtn = this.navElement.querySelector('.moonview-nav-search');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                Dashboard.navigate('search');
            });
        }
        
        // Profile logic
        const profileBtn = this.navElement.querySelector('.moonview-profile-button');
        if (profileBtn) {
            const profileContainer = this.navElement.querySelector('.moonview-nav-profile-container');
            this.profileMenu.render(profileContainer);
            
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.profileMenu.toggle();
            });
        }

        this.updateActiveState();
    }

    handleScroll() {
        if (!this.navElement) return;
        if (window.scrollY > 10) {
            this.navElement.classList.add('moonview-nav-scrolled');
        } else {
            this.navElement.classList.remove('moonview-nav-scrolled');
        }
    }

    destroy() {
        window.removeEventListener('scroll', this.handleScroll.bind(this));
        if (this.profileMenu) {
            this.profileMenu.destroy();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
