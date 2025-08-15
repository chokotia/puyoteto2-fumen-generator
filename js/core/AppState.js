export default class AppState {
    constructor() {
        this.state = {
            currentImage: null,
            analysisResult: null,
            fumenUrl: null,
            status: {
                type: 'loading',
                message: 'モデルを読み込み中...'
            }
        };
        
        this.observers = {};
    }

    // 状態の取得
    getState() {
        return { ...this.state };
    }

    getCurrentImage() {
        return this.state.currentImage;
    }

    getAnalysisResult() {
        return this.state.analysisResult;
    }

    getFumenUrl() {
        return this.state.fumenUrl;
    }

    getStatus() {
        return this.state.status;
    }

    // 状態の更新
    setCurrentImage(imageData) {
        this.state.currentImage = imageData;
        this.notify('imageChanged', imageData);
        this.notify('imageLoaded', imageData);  // アップロード完了の通知
    }

    setAnalysisResult(result) {
        this.state.analysisResult = result;
        this.notify('analysisResultChanged', result);
    }

    setFumenUrl(url) {
        this.state.fumenUrl = url;
        this.notify('fumenUrlChanged', url);
    }

    setStatus(type, message) {
        this.state.status = { type, message };
        this.notify('statusChanged', this.state.status);
    }

    // 分析開始時の状態リセット
    startAnalysis() {
        this.state.analysisResult = null;
        this.state.fumenUrl = null;
        this.setStatus('analyzing', '分析中...');
    }

    // 分析完了時の状態更新
    completeAnalysis(result, fumenUrl) {
        this.setAnalysisResult(result);
        this.setFumenUrl(fumenUrl);
        this.setStatus('success', '🎉 分析完了！Fumen譜面が生成されました');
    }

    // エラー時の状態更新
    setError(message) {
        this.setStatus('error', `❌ エラー: ${message}`);
    }

    // Observer パターンの実装
    subscribe(eventType, callback) {
        if (!this.observers[eventType]) {
            this.observers[eventType] = [];
        }
        this.observers[eventType].push(callback);
    }

    unsubscribe(eventType, callback) {
        if (this.observers[eventType]) {
            this.observers[eventType] = this.observers[eventType].filter(cb => cb !== callback);
        }
    }

    notify(eventType, data) {
        if (this.observers[eventType]) {
            this.observers[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in observer for ${eventType}:`, error);
                }
            });
        }
    }
}
