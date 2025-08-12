import BloxMapCode from '../utils/BloxMapCode.js';
import { generateFumenUrl } from '../utils/fumenUtils.js';

export default class TetrisAnalyzer {
    constructor(modelService, imageService, appState) {
        this.modelService = modelService;
        this.imageService = imageService;
        this.appState = appState;
    }

    async initialize() {
        await this.modelService.loadModel();
    }

    async analyze(imageData) {
        try {
            this.appState.startAnalysis();
            
            // 1. 画像前処理
            const processedCanvas = await this.preprocessImage(imageData.image);
            
            // 2. 盤面分析
            const bloxMapCode = await this.analyzeBoardCells(processedCanvas);
            
            // 3. Fumen URL生成
            const fumenUrl = this.generateFumenUrl(bloxMapCode);
            
            // 4. 結果の状態更新
            this.appState.completeAnalysis(bloxMapCode, fumenUrl);
            
            // 5. Fumen URLを開く
            if (fumenUrl) {
                window.open(fumenUrl, '_blank');
            }
            
        } catch (error) {
            console.error('Analysis failed:', error);
            this.appState.setError('分析中に問題が発生しました');
        }
    }

    async preprocessImage(image) {
        try {
            // 画像をCanvasに描画
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            
            // フレームクロップ処理
            const croppedResult = await this.imageService.cropFrame(canvas);
            return croppedResult?.canvas || canvas;
            
        } catch (error) {
            console.warn('Frame cropping failed, using original image:', error);
            // フレームクロップに失敗した場合は元画像を使用
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            return canvas;
        }
    }

    async analyzeBoardCells(canvas) {
        const predictions = [];
        
        // 10列×20行の各セルを分析
        for (let col = 0; col < 10; col++) {
            for (let row = 0; row < 20; row++) {
                const cellLabel = await this.analyzeSingleCell(canvas, col, row);
                predictions.push(cellLabel);
                
                // 進捗更新
                const progress = Math.floor(((col * 20 + row + 1) / 200) * 100);
                this.appState.setStatus(
                    'analyzing', 
                    `🔄 分析中... ${progress}% (${col * 20 + row + 1}/200セル)`
                );
            }
        }
        
        const labelString = predictions.join('');
        console.log('Analysis result (blox map-code):', labelString);
        
        return new BloxMapCode(labelString);
    }

    async analyzeSingleCell(canvas, col, row) {
        // セル画像の切り出し
        const cellCanvas = this.extractCellImage(canvas, col, row);
        
        // セル画像をImageオブジェクトに変換
        const cellImage = await this.canvasToImage(cellCanvas);
        
        // モデル推論
        const prediction = await this.modelService.predict(cellImage);
        
        return prediction.toString();
    }

    extractCellImage(canvas, col, row) {
        const cellWidth = canvas.width / 10;
        const cellHeight = canvas.height / 20;
        
        const x1 = Math.floor(col * cellWidth);
        const y1 = Math.floor(row * cellHeight);
        const x2 = Math.floor((col + 1) * cellWidth);
        const y2 = Math.floor((row + 1) * cellHeight);
        
        const cellCanvas = document.createElement('canvas');
        const cellCtx = cellCanvas.getContext('2d');
        const cellW = x2 - x1;
        const cellH = y2 - y1;
        
        cellCanvas.width = cellW;
        cellCanvas.height = cellH;
        cellCtx.drawImage(canvas, x1, y1, cellW, cellH, 0, 0, cellW, cellH);
        
        return cellCanvas;
    }

    canvasToImage(canvas) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = canvas.toDataURL();
        });
    }

    generateFumenUrl(bloxMapCode) {
        try {
            return generateFumenUrl(bloxMapCode);
        } catch (error) {
            console.error('Fumen URL generation failed:', error);
            return null;
        }
    }
}