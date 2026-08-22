import * as userSettings from '../scripts/settings/userSettings';
import loading from '../components/loading/loading';
import focusManager from '../components/focusManager';
import { ServerConnections } from 'lib/jellyfin-apiclient';
import { MoonviewHome } from '../components/moonview/MoonviewHome/MoonviewHome';

import '../elements/emby-itemscontainer/emby-itemscontainer';

class HomeTab {
    constructor(view, params) {
        this.view = view;
        this.params = params;
        this.apiClient = ServerConnections.currentApiClient();
        this.sectionsContainer = view.querySelector('.sections');
        view.querySelector('.sections').addEventListener('settingschange', onHomeScreenSettingsChanged.bind(this));
    }
    onResume(options) {
        if (this.sectionsRendered) {
            return Promise.resolve();
        }

        loading.show();
        const view = this.view;
        this.destroyHomeSections();
        this.sectionsRendered = true;

        const sectionsContainer = view.querySelector('.sections');

        if (!this.moonviewHome) {
            this.moonviewHome = new MoonviewHome(sectionsContainer);
        }

        return this.moonviewHome.render()
            .then(() => {
                if (options.autoFocus) {
                    focusManager.autoFocus(view);
                }
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                loading.hide();
            });
    }
    onPause() {
        // MoonviewHome has no pause logic currently
    }
    destroy() {
        this.view = null;
        this.params = null;
        this.apiClient = null;
        this.destroyHomeSections();
        this.sectionsContainer = null;
    }
    destroyHomeSections() {
        if (this.moonviewHome) {
            this.moonviewHome.destroy();
            this.moonviewHome = null;
        }
    }
}

function onHomeScreenSettingsChanged() {
    this.sectionsRendered = false;

    if (!this.paused) {
        this.onResume({
            refresh: true
        });
    }
}

export default HomeTab;
