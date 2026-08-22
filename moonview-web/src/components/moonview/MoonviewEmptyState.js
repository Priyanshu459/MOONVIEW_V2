import globalize from 'lib/globalize';
import './MoonviewEmptyState.scss';

export class MoonviewEmptyState {
    constructor(container) {
        this.container = container;
    }

    render(options = {}) {
        const title = options.title || globalize.translate('MessageNothingHere');
        const message = options.message || '';
        const icon = options.icon || 'video_library'; // default material icon

        const html = `
            <div class="moonview-empty-state">
                <i class="md-icon moonview-empty-icon">${icon}</i>
                <h2 class="moonview-empty-title">${title}</h2>
                <p class="moonview-empty-message">${message}</p>
            </div>
        `;

        this.container.innerHTML = html;
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}
