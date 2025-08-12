export default class StatusDisplay {
    constructor(appState) {
        this.appState = appState;
        
        this.initializeElements();
        this.setupObservers();
    }

    initializeElements() {
        this.statusDiv = document.getElementById('statusDiv');
    }

    setupObservers() {
        // ステータス変更時の表示更新
        this.appState.subscribe('statusChanged', (status) => {
            this.updateStatus(status);
        });
    }

    updateStatus(status) {
        if (!this.statusDiv) return;

        const { type, message } = status;
        const statusClass = this.getStatusClass(type);
        
        this.statusDiv.innerHTML = `<div class="status ${statusClass}">${message}</div>`;
    }

    getStatusClass(type) {
        const classMap = {
            'loading': 'loading',
            'analyzing': 'loading',
            'ready': 'success',
            'success': 'success',
            'error': 'error'
        };
        
        return classMap[type] || '';
    }

    clear() {
        if (this.statusDiv) {
            this.statusDiv.innerHTML = '';
        }
    }
}
