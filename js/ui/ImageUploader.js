import ImageService from '../services/ImageService.js';

export default class ImageUploader {
    constructor(appState) {
        this.appState = appState;
        this.imageService = new ImageService();
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupObservers();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.uploadContent = document.getElementById('uploadContent');
        this.analysisContent = document.getElementById('analysisContent');
        this.previewImage = document.getElementById('previewImage');
    }

    setupEventListeners() {
        // ファイル選択
        this.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // アップロードエリアクリック
        this.uploadArea?.addEventListener('click', () => this.openFileDialog());
        
        // ドラッグ&ドロップ
        this.setupDragAndDrop();
        
        // クリップボード貼り付け
        this.setupClipboardPaste();
    }

    setupObservers() {
        // 画像変更時のプレビュー表示
        this.appState.subscribe('imageChanged', (imageData) => {
            this.showImagePreview(imageData);
        });
    }

    openFileDialog() {
        if (this.fileInput && !this.uploadArea?.classList.contains('has-image')) {
            this.fileInput.click();
        }
    }

    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            await this.processFile(file, 'file-input');
        }
    }

    async processFile(file, source = 'unknown') {
        try {
            const imageData = await this.imageService.fileToImage(file);
            imageData.source = source;
            
            this.appState.setCurrentImage(imageData);
            
        } catch (error) {
            console.error('File processing failed:', error);
            this.appState.setError(error.message);
        }
    }

    setupDragAndDrop() {
        if (!this.uploadArea) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        this.uploadArea.addEventListener('dragenter', () => {
            this.uploadArea.classList.add('drag-over');
        });

        this.uploadArea.addEventListener('dragleave', (e) => {
            if (!this.uploadArea.contains(e.relatedTarget)) {
                this.uploadArea.classList.remove('drag-over');
            }
        });

        this.uploadArea.addEventListener('drop', async (e) => {
            this.uploadArea.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFile = files.find(file => this.imageService.isImageFile(file));
            
            if (imageFile) {
                await this.processFile(imageFile, 'drag-and-drop');
            } else if (files.length > 0) {
                this.appState.setError('サポートされていないファイル形式です');
            }
        });
    }

    setupClipboardPaste() {
        document.addEventListener('paste', async (e) => {
            const items = e.clipboardData.items;
            
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    await this.processFile(blob, 'clipboard');
                    e.preventDefault();
                    break;
                }
            }
        });
    }

    showImagePreview(imageData) {
        if (!this.uploadContent || !this.analysisContent || !this.previewImage) return;

        // UI状態を更新
        this.uploadContent.style.display = 'none';
        this.analysisContent.style.display = 'block';
        this.previewImage.src = imageData.dataUrl;
        
        // アップロードエリアのスタイル更新
        if (this.uploadArea) {
            this.uploadArea.classList.add('has-image');
        }

        console.log(`Image loaded from: ${imageData.source}`);
    }

    reset() {
        // UI状態をリセット
        if (this.uploadContent) this.uploadContent.style.display = 'block';
        if (this.analysisContent) this.analysisContent.style.display = 'none';
        if (this.fileInput) this.fileInput.value = '';
        
        if (this.uploadArea) {
            this.uploadArea.classList.remove('has-image', 'drag-over');
        }
    }
}