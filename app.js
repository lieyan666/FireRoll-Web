class LotteryApp {
    constructor() {
        this.nameList = [];
        this.winners = [];
        this.isDrawing = false;
        this.settings = {
            effectEnabled: true,
            soundEnabled: false,
            confettiEnabled: true,
            rollingSpeed: 100,
            allowDuplicate: false
        };
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadData();
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // 文件上传
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // 手动添加名单
        document.getElementById('addNamesBtn').addEventListener('click', () => {
            const textarea = document.getElementById('nameInput');
            const names = textarea.value.trim().split('\n').filter(name => name.trim());
            if (names.length > 0) {
                this.addNames(names);
                textarea.value = '';
            }
        });

        // 清空名单
        document.getElementById('clearListBtn').addEventListener('click', () => {
            if (confirm('确定要清空所有名单吗？')) {
                this.nameList = [];
                this.updateUI();
                this.saveData();
            }
        });

        // 开始抽奖
        document.getElementById('drawBtn').addEventListener('click', () => {
            if (!this.isDrawing) {
                this.startDraw();
            } else {
                this.stopDraw();
            }
        });

        // 重置
        document.getElementById('resetBtn').addEventListener('click', () => {
            if (confirm('确定要重置所有中奖名单吗？')) {
                this.winners = [];
                this.updateUI();
                this.saveData();
            }
        });

        // 导出结果
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportResults();
        });

        // 设置相关
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('active');
            this.loadSettingsUI();
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.remove('active');
        });

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
            document.getElementById('settingsModal').classList.remove('active');
        });

        // 速度滑块
        document.getElementById('speedRange').addEventListener('input', (e) => {
            document.getElementById('speedValue').textContent = e.target.value;
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isDrawing && this.nameList.length > 0) {
                e.preventDefault();
                this.startDraw();
            }
        });
    }

    handleFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const names = content.split(/[\n\r,]+/)
                .map(name => name.trim())
                .filter(name => name);

            if (names.length > 0) {
                this.addNames(names);
            }
        };
        reader.readAsText(file);
    }

    addNames(names) {
        const newNames = names.map(name => ({
            id: Date.now() + Math.random(),
            name: name.trim(),
            addedAt: new Date().toISOString()
        }));

        this.nameList.push(...newNames);
        this.updateUI();
        this.saveData();
        this.showNotification(`成功添加 ${names.length} 个名字`);
    }

    removeName(id) {
        this.nameList = this.nameList.filter(item => item.id !== id);
        this.updateUI();
        this.saveData();
    }

    startDraw() {
        const availableNames = this.getAvailableNames();
        if (availableNames.length === 0) {
            alert('没有可抽取的名单！');
            return;
        }

        const drawCount = parseInt(document.getElementById('drawCount').value) || 1;
        if (drawCount > availableNames.length) {
            alert(`可抽取人数不足！当前可抽取 ${availableNames.length} 人`);
            return;
        }

        this.isDrawing = true;
        const drawBtn = document.getElementById('drawBtn');
        drawBtn.classList.add('drawing');
        drawBtn.querySelector('.btn-text').textContent = '停止';

        // 显示滚动效果
        const rollingNames = document.getElementById('rollingNames');
        const winnerDisplay = document.getElementById('winnerDisplay');

        if (this.settings.effectEnabled) {
            rollingNames.classList.add('active');
            rollingNames.style.display = 'block';
            winnerDisplay.style.display = 'none';

            // 滚动名字
            this.rollingInterval = setInterval(() => {
                const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
                rollingNames.textContent = randomName.name;
            }, this.settings.rollingSpeed);

            // 自动停止
            setTimeout(() => {
                this.stopDraw();
            }, 3000 + Math.random() * 2000);
        } else {
            // 直接抽取
            setTimeout(() => {
                this.stopDraw();
            }, 100);
        }
    }

    stopDraw() {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        const drawBtn = document.getElementById('drawBtn');
        drawBtn.classList.remove('drawing');
        drawBtn.querySelector('.btn-text').textContent = '开始抽奖';

        // 清除滚动
        if (this.rollingInterval) {
            clearInterval(this.rollingInterval);
            this.rollingInterval = null;
        }

        const rollingNames = document.getElementById('rollingNames');
        const winnerDisplay = document.getElementById('winnerDisplay');

        rollingNames.classList.remove('active');
        rollingNames.style.display = 'none';
        winnerDisplay.style.display = 'flex';

        // 抽取中奖者
        const drawCount = parseInt(document.getElementById('drawCount').value) || 1;
        const selectedWinners = this.drawWinners(drawCount);

        if (selectedWinners.length > 0) {
            // 显示中奖者
            this.displayWinners(selectedWinners);

            // 添加到中奖名单
            this.winners.push(...selectedWinners);
            this.updateUI();
            this.saveData();

            // 播放特效
            if (this.settings.confettiEnabled) {
                this.playConfetti();
            }

            if (this.settings.soundEnabled) {
                this.playSound();
            }
        }
    }

    drawWinners(count) {
        const availableNames = this.getAvailableNames();
        const winners = [];

        for (let i = 0; i < Math.min(count, availableNames.length); i++) {
            const randomIndex = Math.floor(Math.random() * availableNames.length);
            const winner = availableNames[randomIndex];

            winners.push({
                ...winner,
                winTime: new Date().toISOString(),
                round: this.getCurrentRound()
            });

            // 从可用名单中移除
            availableNames.splice(randomIndex, 1);
        }

        return winners;
    }

    getAvailableNames() {
        if (this.settings.allowDuplicate) {
            return [...this.nameList];
        } else {
            const winnerIds = this.winners.map(w => w.id);
            return this.nameList.filter(item => !winnerIds.includes(item.id));
        }
    }

    getCurrentRound() {
        const rounds = this.winners.map(w => w.round || 1);
        return rounds.length > 0 ? Math.max(...rounds) + 1 : 1;
    }

    displayWinners(winners) {
        const winnerDisplay = document.getElementById('winnerDisplay');

        if (winners.length === 1) {
            winnerDisplay.innerHTML = `
                <div class="winner-animation">
                    <div class="winner-name">${winners[0].name}</div>
                    <div class="winner-badge">🎉 恭喜中奖！</div>
                </div>
            `;
        } else {
            const winnerNames = winners.map(w => w.name).join('、');
            winnerDisplay.innerHTML = `
                <div class="winner-animation">
                    <div class="winner-name" style="font-size: 36px;">${winnerNames}</div>
                    <div class="winner-badge">🎉 ${winners.length}人中奖！</div>
                </div>
            `;
        }
    }

    playConfetti() {
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        const colors = ['#ff6b35', '#f7931e', '#ffc107', '#4caf50', '#2196f3', '#9c27b0'];

        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(confetti);
        }

        setTimeout(() => {
            container.remove();
        }, 5000);
    }

    playSound() {
        // 创建简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    exportResults() {
        if (this.winners.length === 0) {
            alert('暂无中奖名单可导出');
            return;
        }

        const exportData = this.winners.map((winner, index) => ({
            序号: index + 1,
            姓名: winner.name,
            中奖时间: new Date(winner.winTime).toLocaleString(),
            轮次: winner.round || 1
        }));

        // 导出为CSV
        const csv = this.convertToCSV(exportData);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `中奖名单_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row =>
            headers.map(header => `"${row[header]}"`).join(',')
        );
        return [csvHeaders, ...csvRows].join('\n');
    }

    updateUI() {
        // 更新名单列表
        const nameListEl = document.getElementById('nameList');
        nameListEl.innerHTML = this.nameList.map(item => `
            <li>
                <span>${item.name}</span>
                <button onclick="app.removeName(${item.id})">×</button>
            </li>
        `).join('');

        // 更新名单数量
        document.getElementById('totalCount').textContent = this.nameList.length;

        // 更新中奖名单
        const winnerListEl = document.getElementById('winnerList');
        winnerListEl.innerHTML = this.winners.slice().reverse().map((winner, index) => `
            <li>
                <span class="winner-number">${this.winners.length - index}</span>
                <span>${winner.name}</span>
            </li>
        `).join('');

        // 更新中奖人数
        document.getElementById('winnerCount').textContent = this.winners.length;
    }

    loadSettings() {
        const saved = localStorage.getItem('lotterySettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        this.settings = {
            effectEnabled: document.getElementById('effectToggle').checked,
            soundEnabled: document.getElementById('soundToggle').checked,
            confettiEnabled: document.getElementById('confettiToggle').checked,
            rollingSpeed: parseInt(document.getElementById('speedRange').value),
            allowDuplicate: document.getElementById('allowDuplicate').checked
        };

        localStorage.setItem('lotterySettings', JSON.stringify(this.settings));
        this.showNotification('设置已保存');
    }

    loadSettingsUI() {
        document.getElementById('effectToggle').checked = this.settings.effectEnabled;
        document.getElementById('soundToggle').checked = this.settings.soundEnabled;
        document.getElementById('confettiToggle').checked = this.settings.confettiEnabled;
        document.getElementById('speedRange').value = this.settings.rollingSpeed;
        document.getElementById('speedValue').textContent = this.settings.rollingSpeed;
        document.getElementById('allowDuplicate').checked = this.settings.allowDuplicate;
    }

    loadData() {
        const savedNames = localStorage.getItem('lotteryNames');
        const savedWinners = localStorage.getItem('lotteryWinners');

        if (savedNames) {
            this.nameList = JSON.parse(savedNames);
        }

        if (savedWinners) {
            this.winners = JSON.parse(savedWinners);
        }
    }

    saveData() {
        localStorage.setItem('lotteryNames', JSON.stringify(this.nameList));
        localStorage.setItem('lotteryWinners', JSON.stringify(this.winners));
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }

    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }

    .winner-animation {
        animation: zoomIn 0.5s ease-out;
    }
`;
document.head.appendChild(style);

// 初始化应用
const app = new LotteryApp();