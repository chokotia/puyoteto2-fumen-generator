// ui/BoardRenderer.js - テトリス盤面表示 UI
export default class BoardRenderer {
    constructor(appState) {
        this.appState = appState;
        
        this.initializeElements();
        this.setupObservers();
    }

    initializeElements() {
        this.boardSection = document.getElementById('boardSection');
        this.tetrisBoard = document.getElementById('tetrisBoard');
    }

    setupObservers() {
        // 分析結果変更時の盤面描画
        this.appState.subscribe('analysisResultChanged', (result) => {
            if (result) {
                this.renderBoard(result);
                this.showBoard();
            } else {
                this.hideBoard();
            }
        });

        // 画像変更時の盤面リセット
        this.appState.subscribe('imageChanged', () => {
            this.hideBoard();
        });
    }

    renderBoard(bloxMapCode) {
        if (!this.tetrisBoard) return;

        // 盤面をクリア
        this.tetrisBoard.innerHTML = '';

        // 20行×10列のセルを作成
        for (let row = 0; row < 20; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = this.createCell(row, col);
                this.tetrisBoard.appendChild(cell);
            }
        }

        // データを解析して盤面に反映
        for (let i = 0; i < 200; i++) {
            const minoIndex = parseInt(bloxMapCode.toString()[i]);
            
            // 列優先でのインデックス計算
            const col = Math.floor(i / 20);  // 列 (0-9)
            const row = i % 20;              // 行 (0-19)
            
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (cell) {
                this.setCellMino(cell, minoIndex);
            }
        }
    }

    createCell(row, col) {
        const cell = document.createElement('div');
        cell.className = 'cell mino-empty';
        cell.id = `cell-${row}-${col}`;
        return cell;
    }

    setCellMino(cell, minoIndex) {
        // 既存のミノクラスを除去
        const minoClasses = [
            'mino-empty', 'mino-I', 'mino-O', 'mino-T',
            'mino-L', 'mino-J', 'mino-S', 'mino-Z', 'mino-X'
        ];
        
        minoClasses.forEach(cls => cell.classList.remove(cls));
        
        // 新しいミノクラスを追加
        cell.classList.add(minoClasses[minoIndex] || 'mino-empty');
    }

    showBoard() {
        if (this.boardSection) {
            this.boardSection.style.display = 'block';
        }
    }

    hideBoard() {
        if (this.boardSection) {
            this.boardSection.style.display = 'none';
        }
    }

    clear() {
        this.hideBoard();
        if (this.tetrisBoard) {
            this.tetrisBoard.innerHTML = '';
        }
    }
}