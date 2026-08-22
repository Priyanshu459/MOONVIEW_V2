import { ServerConnections } from 'lib/jellyfin-apiclient';
import globalize from 'lib/globalize';
import layoutManager from 'components/layoutManager';
import Dashboard from 'utils/dashboard';
import itemHelper from 'components/itemHelper';

import './MoonviewHero.scss';

export class MoonviewHero {
    constructor(container) {
        this.container = container;
        this.apiClient = ServerConnections.currentApiClient();
        this.heroElement = null;
    }

    async render() {
        const userId = this.apiClient.getCurrentUserId();
        
        // Fetch eligible recently added items to feature
        let featuredItem = null;
        try {
            const result = await this.apiClient.getItems(userId, {
                SortBy: 'DateCreated',
                SortOrder: 'Descending',
                IncludeItemTypes: 'Movie,Series',
                Limit: 10,
                Recursive: true,
                Fields: 'Overview,PrimaryImageAspectRatio,BackdropImageTags,Genres,Studios'
            });

            if (result.Items && result.Items.length > 0) {
                // Select random item from recent 10 to add dynamic feel
                featuredItem = result.Items[Math.floor(Math.random() * result.Items.length)];
            }
        } catch (e) {
            console.error('Failed to fetch featured item', e);
        }

        if (!featuredItem) {
            this.container.innerHTML = '';
            return; // Hide hero if no item
        }

        const backdropUrl = featuredItem.ImageTags && featuredItem.ImageTags.Backdrop ?
            this.apiClient.getScaledImageUrl(featuredItem.Id, { type: 'Backdrop', maxWidth: 1920 }) :
            this.apiClient.getScaledImageUrl(featuredItem.Id, { type: 'Primary', maxWidth: 1920 });
            
        const logoUrl = featuredItem.ImageTags && featuredItem.ImageTags.Logo ? 
            this.apiClient.getScaledImageUrl(featuredItem.Id, { type: 'Logo', maxWidth: 400 }) : null;

        const titleHtml = logoUrl 
            ? `<img class="moonview-hero-logo" src="${logoUrl}" alt="${featuredItem.Name}" />` 
            : `<h1 class="moonview-hero-title">${featuredItem.Name}</h1>`;

        const year = featuredItem.ProductionYear || '';
        let runtime = '';
        if (featuredItem.RunTimeTicks) {
            const minutes = Math.floor(featuredItem.RunTimeTicks / 10000 / 1000 / 60);
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            runtime = h > 0 ? `${h}h ${m}m` : `${m}m`;
        }
        const rating = featuredItem.OfficialRating || '';
        const genres = featuredItem.Genres ? featuredItem.Genres.slice(0, 3).join(' • ') : '';
        
        const metaList = [year, runtime, rating, genres].filter(Boolean).join(' <span class="moonview-hero-meta-dot">•</span> ');

        const playButtonText = featuredItem.UserData && featuredItem.UserData.PlaybackPositionTicks > 0 
            ? globalize.translate('Resume') 
            : globalize.translate('Play');

        const html = `
            <div class="moonview-hero">
                <div class="moonview-hero-backdrop" style="background-image: url('${backdropUrl}');">
                    <div class="moonview-hero-vignette"></div>
                </div>
                <div class="moonview-hero-content">
                    ${titleHtml}
                    <div class="moonview-hero-metadata">${metaList}</div>
                    <p class="moonview-hero-overview">${featuredItem.Overview || ''}</p>
                    
                    <div class="moonview-hero-actions">
                        <button class="emby-button moonview-btn moonview-btn-primary" data-action="play" data-itemid="${featuredItem.Id}">
                            <span class="material-icons play_arrow" aria-hidden="true"></span>
                            <span>${playButtonText}</span>
                        </button>
                        <button class="emby-button moonview-btn moonview-btn-secondary" data-action="more-info" data-itemid="${featuredItem.Id}">
                            <span class="material-icons info" aria-hidden="true"></span>
                            <span>${globalize.translate('MoreInfo')}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.heroElement = this.container.querySelector('.moonview-hero');

        // Attach events
        const playBtn = this.heroElement.querySelector('[data-action="play"]');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-itemid');
                import('components/playback/playbackmanager').then((playbackManager) => {
                    playbackManager.playbackManager.play({ ids: [itemId] });
                });
            });
        }

        const infoBtn = this.heroElement.querySelector('[data-action="more-info"]');
        if (infoBtn) {
            infoBtn.addEventListener('click', (e) => {
                const itemId = e.currentTarget.getAttribute('data-itemid');
                Dashboard.navigate(`item?id=${itemId}`);
            });
        }
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
