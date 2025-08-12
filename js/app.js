import TetrisAnalyzer from './core/TetrisAnalyzer.js';
import AppState from './core/AppState.js';
import ModelService from './services/ModelService.js';
import ImageService from './services/ImageService.js';
import ImageUploader from './ui/ImageUploader.js';
import BoardRenderer from './ui/BoardRenderer.js';
import StatusDisplay from './ui/StatusDisplay.js';

class TetrisApp {
    constructor() {
        this.appState = new AppState();
        this.initializeServices();
        this.initializeUI();
        this.connectComponents();
    }

    initializeServices() {
        const modelService = new ModelService();
        const imageService = new ImageService();
        this.analyzer = new TetrisAnalyzer(modelService, imageService, this.appState);
    }

    initializeUI() {
        this.uploader = new ImageUploader(this.appState);
        this.boardRenderer = new BoardRenderer(this.appState);
        this.statusDisplay = new StatusDisplay(this.appState);
    }

    connectComponents() {
        // 画像アップロード時の分析開始
        this.appState.subscribe('imageLoaded', async (imageData) => {
            await this.analyzer.analyze(imageData);
        });
    }

    async start() {
        try {
            await this.analyzer.initialize();
            this.appState.setStatus('ready', '準備完了');
        } catch (error) {
            this.appState.setStatus('error', 'アプリケーションの初期化に失敗しました');
            console.error('App initialization failed:', error);
        }
    }
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', async () => {
    const app = new TetrisApp();
    await app.start();
});
