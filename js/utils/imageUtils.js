import processBothPlayersFrames from './cropFrameHelper.js';

/**
 * セル単位の画像前処理（224x224にリサイズして正規化）
 */
export function preprocessImage(imageElement, targetWidth = 224, targetHeight = 224) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(imageElement, 0, 0, targetWidth, targetHeight);
    
    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
    const data = imageData.data;
    
    // RGB値を[0,1]に正規化
    const input = new Float32Array(1 * 3 * targetWidth * targetHeight);
    
    for (let i = 0; i < targetWidth * targetHeight; i++) {
        const r = data[i * 4] / 255.0;
        const g = data[i * 4 + 1] / 255.0;
        const b = data[i * 4 + 2] / 255.0;
        
        input[i] = r;
        input[targetWidth * targetHeight + i] = g;
        input[targetWidth * targetHeight * 2 + i] = b;
    }
    
    return input;
}

/**
 * フレームクロップ処理（テトリス盤面単位の画像前処理）
 */
export async function cropFrameAdvanced(canvas, options = {}) {
    // cropFrame.jsの全機能をここに移植
    // 簡略化のため、基本的な実装のみ提供
    try {
        const result = await processBothPlayersFrames(canvas, options);
        return result?.players["1P2P"]?.cropped;
    } catch (error) {
        console.warn('Advanced frame cropping failed, returning original canvas:', error);
        return { canvas };
    }
}
