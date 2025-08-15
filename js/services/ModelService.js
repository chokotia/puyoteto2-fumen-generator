import { preprocessImage } from '../utils/imageUtils.js';
import { CONFIG } from '../utils/constants.js';

export default class ModelService {
    constructor() {
        this.session = null;
        this.isLoaded = false;
    }

    async loadModel() {
        if (this.session) {
            return this.session; // 既に読み込み済み
        }

        try {
            console.log('Loading ONNX model...');
            this.session = await ort.InferenceSession.create(CONFIG.MODEL_PATH);
            this.isLoaded = true;
            console.log('Model loaded successfully');
            return this.session;
            
        } catch (error) {
            console.error('Failed to load model:', error);
            throw new Error('モデルファイル(tetris_mobilenet_v3_small.onnx)が見つかりません');
        }
    }

    async predict(imageElement) {
        if (!this.isLoaded) {
            throw new Error('Model is not loaded');
        }

        try {
            // 画像前処理
            const inputData = preprocessImage(imageElement);
            
            // 推論実行
            const inputTensor = new ort.Tensor('float32', inputData, [1, 3, 224, 224]);
            const outputMap = await this.session.run({ input: inputTensor });
            const output = outputMap.output.data;
            
            // 最大値のインデックスを取得
            return this.getMaxIndex(output);
            
        } catch (error) {
            console.error('Prediction failed:', error);
            throw new Error('推論処理に失敗しました');
        }
    }

    getMaxIndex(outputArray) {
        let maxIndex = 0;
        let maxValue = outputArray[0];
        
        for (let i = 1; i < outputArray.length; i++) {
            if (outputArray[i] > maxValue) {
                maxValue = outputArray[i];
                maxIndex = i;
            }
        }
        
        return maxIndex;
    }

    getModelInfo() {
        return {
            isLoaded: this.isLoaded,
            modelPath: CONFIG.MODEL_PATH
        };
    }
}