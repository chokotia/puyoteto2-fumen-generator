import { LABEL_NAMES } from './constants.js';

export default class BloxMapCode {
    /**
     * @param {string} code - 200文字で0-8の数字列
     */
    constructor(code) {
        if (typeof code !== 'string') {
            throw new TypeError('BloxMapCodeは文字列である必要があります');
        }
        if (code.length !== 200) {
            throw new RangeError(`入力データは200文字である必要があります。現在: ${code.length}文字`);
        }
        if (!/^[0-8]+$/.test(code)) {
            throw new Error('入力データは0-8の数字のみである必要があります。');
        }

        this._code = code;
        Object.freeze(this); // イミュータブル化（変更禁止）
    }

    /** blox mapcodeの文字列を返す */
    toString() {
        return this._code;
    }

    convertToFumenField() {
        let fumenFieldString = '';
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const blockNumber = parseInt(this._code[col * 20 + row], 10);
                const fumenLabel = LABEL_NAMES[blockNumber];
                if (fumenLabel === undefined) {
                    throw new Error(`無効なブロック番号: ${blockNumber} (位置: 列${col}, 行${row})`);
                }
                fumenFieldString += fumenLabel;
            }
        }
        return fumenFieldString;
    }
}
