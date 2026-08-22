import { ServerConnections } from 'lib/jellyfin-apiclient';
import globalize from 'lib/globalize';
import cardBuilder from 'components/cardbuilder/cardBuilder';
import { getPortraitShape, getBackdropShape } from 'utils/card';
import { MoonviewHero } from '../MoonviewHero';
import Dashboard from 'utils/dashboard';
import { appRouter } from 'components/router/appRouter';

import 'elements/emby-itemscontainer/emby-itemscontainer';
import 'elements/emby-scroller/emby-scroller';

import './MoonviewHome.scss';

export class MoonviewHome {
    constructor(container) {
        this.container = container;
        this.apiClient = ServerConnections.currentApiClient();
        this.hero = null;
    }

    async render() {
        this.container.innerHTML = '';
        this.container.classList.add('moonview-home-container');

        const userId = this.apiClient.getCurrentUserId();
        const user = await this.apiClient.getCurrentUser();

        // 1. Render Hero
        const heroContainer = document.createElement('div');
        heroContainer.className = 'moonview-home-hero-section';
        this.container.appendChild(heroContainer);
        
        this.hero = new MoonviewHero(heroContainer);
        await this.hero.render();

        // 2. Container for Rails
        const railsContainer = document.createElement('div');
        railsContainer.className = 'moonview-home-rails padded-left padded-right';
        this.container.appendChild(railsContainer);

        // Build rails
        await this.buildContinueWatching(railsContainer, userId);
        await this.buildRecentlyAdded(railsContainer, userId);
        await this.buildMoviesRail(railsContainer, userId);
        await this.buildSeriesRail(railsContainer, userId);
    }

    async buildContinueWatching(container, userId) {
        try {
            const result = await this.apiClient.getResumeItems(userId, {
                Limit: 12,
                Fields: 'PrimaryImageAspectRatio,BasicSyncInfo,MediaSourceCount',
                ImageTypeLimit: 1,
                EnableImageTypes: 'Primary,Backdrop,Thumb',
                MediaTypes: 'Video'
            });

            if (result.Items && result.Items.length > 0) {
                this.renderRail(container, globalize.translate('HeaderContinueWatching') || 'Continue Watching', result.Items, getBackdropShape(true));
            }
        } catch (e) {
            console.error('Failed to load continue watching', e);
        }
    }

    async buildRecentlyAdded(container, userId) {
        try {
            // Aggregate latest items across all libraries
            const result = await this.apiClient.getItems(userId, {
                Limit: 12,
                SortBy: 'DateCreated',
                SortOrder: 'Descending',
                Fields: 'PrimaryImageAspectRatio,Path',
                ImageTypeLimit: 1,
                EnableImageTypes: 'Primary,Backdrop,Thumb',
                IncludeItemTypes: 'Movie,Series',
                Recursive: true
            });

            if (result.Items && result.Items.length > 0) {
                this.renderRail(container, globalize.translate('RecentlyAdded') || 'Recently Added', result.Items, getPortraitShape(true));
            }
        } catch (e) {
            console.error('Failed to load recently added', e);
        }
    }

    async buildMoviesRail(container, userId) {
        try {
            const result = await this.apiClient.getItems(userId, {
                SortBy: 'Random,SortName',
                SortOrder: 'Descending',
                IncludeItemTypes: 'Movie',
                Recursive: true,
                Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
                ImageTypeLimit: 1,
                EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
                Limit: 12
            });

            if (result.Items && result.Items.length > 0) {
                this.renderRail(container, globalize.translate('Movies') || 'Movies', result.Items, getPortraitShape(true));
            }
        } catch (e) {
            console.error('Failed to load movies', e);
        }
    }

    async buildSeriesRail(container, userId) {
        try {
            const result = await this.apiClient.getItems(userId, {
                SortBy: 'Random,SortName',
                SortOrder: 'Descending',
                IncludeItemTypes: 'Series',
                Recursive: true,
                Fields: 'PrimaryImageAspectRatio,MediaSourceCount,BasicSyncInfo',
                ImageTypeLimit: 1,
                EnableImageTypes: 'Primary,Backdrop,Banner,Thumb',
                Limit: 12
            });

            if (result.Items && result.Items.length > 0) {
                this.renderRail(container, globalize.translate('Shows') || 'Series', result.Items, getPortraitShape(true));
            }
        } catch (e) {
            console.error('Failed to load series', e);
        }
    }

    renderRail(container, title, items, shape) {
        const section = document.createElement('div');
        section.className = 'verticalSection';

        const titleHtml = `
            <div class="sectionTitleContainer sectionTitleContainer-cards">
                <h2 class="sectionTitle sectionTitle-cards">${title}</h2>
            </div>
        `;

        const html = cardBuilder.getCardsHtml({
            items: items,
            shape: shape,
            preferThumb: 'auto',
            showUnplayedIndicator: false,
            showChildCountIndicator: true,
            context: 'home',
            overlayText: false,
            centerText: false,
            overlayPlayButton: true,
            allowBottomPadding: false,
            showTitle: true,
            showYear: true,
            showParentTitle: true,
            lines: 2
        });

        section.innerHTML = `
            ${titleHtml}
            <div is="emby-scroller" class="padded-top-focusscale padded-bottom-focusscale" data-centerfocus="true">
                <div is="emby-itemscontainer" class="itemsContainer scrollSlider focuscontainer-x">
                    ${html}
                </div>
            </div>
        `;

        container.appendChild(section);
        
        // Attach click events natively using jellyfin itemHelper or just data-attributes
        const cards = section.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('click', (e) => {
                const id = card.getAttribute('data-id');
                const type = card.getAttribute('data-type');
                const isFolder = card.getAttribute('data-isfolder') === 'true';
                
                // standard jellyfin routing for items
                if (id) {
                    Dashboard.navigate(`item?id=${id}`);
                }
            });
        });
    }

    destroy() {
        if (this.hero) {
            this.hero.destroy();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
