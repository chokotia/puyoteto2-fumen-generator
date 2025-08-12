// services/ImageService.js - 画像処理サービス
import { cropFrameAdvanced } from '../utils/imageUtils.js';

export default class ImageService {
    constructor() {
        this.supportedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    }

    /**
     * フレームクロップ処理
     */
    async cropFrame(canvas, options = {}) {
        try {
            return await cropFrameAdvanced(canvas, options);
        } catch (error) {
            console.warn('Frame cropping failed:', error);
            return { canvas }; // 失敗時は元のcanvasを返す
        }
    }

    /**
     * ファイルが画像かどうかチェック
     */
    isImageFile(file) {
        return this.supportedTypes.includes(file.type);
    }

    /**
     * ファイルをImageオブジェクトに変換
     */
    async fileToImage(file) {
        if (!this.isImageFile(file)) {
            throw new Error(`サポートされていないファイル形式: ${file.type}`);
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    resolve({
                        image: img,
                        dataUrl: e.target.result,
                        file: file
                    });
                };
                
                img.onerror = () => {
                    reject(new Error('画像の読み込みに失敗しました'));
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                reject(new Error('ファイルの読み込みに失敗しました'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Base64をImageオブジェクトに変換
     */
    async base64ToImage(base64String) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Base64画像の読み込みに失敗しました'));
            
            img.src = base64String;
        });
    }

    /**
     * CanvasをBase64に変換
     */
    canvasToBase64(canvas, type = 'image/png') {
        return canvas.toDataURL(type);
    }

    /**
     * 画像のサイズ情報を取得
     */
    getImageInfo(image) {
        return {
            width: image.width,
            height: image.height,
            aspectRatio: image.width / image.height
        };
    }
}