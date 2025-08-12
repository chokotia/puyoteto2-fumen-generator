import { CONFIG } from './constants.js';

/**
 * BloxのmapCodeからFumen URLを生成
 * @param {BloxMapCode} bloxMapCode - Bloxの200文字数字列
 * @param {string} comment - Fumenに付けるコメント（オプション）
 * @returns {string} Fumen URL
 * @throws {Error} 変換に失敗した場合
 */
export function generateFumenUrl(bloxMapCode, comment = '') {
    try {
        // BloxのmapCodeをFumenフィールド文字列に変換
        const fumenFieldString = bloxMapCode.convertToFumenField();
        
        // tetris-fumen ライブラリを使用してFumen形式にエンコード
        const field = TetrisFumen.Field.create(fumenFieldString);
        const pages = [{ field, comment }];
        const encodedFumen = TetrisFumen.encoder.encode(pages);
        
        // Fumen URLを生成
        return `${CONFIG.FUMEN_BASE_URL}${encodedFumen}`;
        
    } catch (error) {
        console.error('BloxからFumen URL生成エラー:', error.message);
        throw new Error(`Fumen URL生成に失敗しました: ${error.message}`);
    }
}
