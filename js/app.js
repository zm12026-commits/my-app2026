/**
 * ぷりぷりダイアリー - JS Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 状態管理
    let entries = JSON.parse(localStorage.getItem('puri-diary-entries')) || [];

    // DOM要素
    const diaryForm = document.getElementById('diary-form');
    const dateInput = document.getElementById('date-input');
    const textInput = document.getElementById('text-input');
    const entriesContainer = document.getElementById('entries-container');
    const charCount = document.getElementById('char-count');
    const praiseMessage = document.getElementById('praise-message');
    const starsContainer = document.getElementById('stars-container');

    const moodIcons = {
        happy: '😊',
        good: '🙂',
        normal: '😐',
        sad: '😟',
        cry: '😭'
    };

    /**
     * 背景のキラキラを生成
     */
    const createStars = () => {
        for (let i = 0; i < 15; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            const size = Math.random() * 20 + 10;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animation = `floating ${Math.random() * 3 + 2}s ease-in-out infinite ${Math.random() * -5}s`;
            starsContainer.appendChild(star);
        }
    };

    /**
     * 今日の日付をセット
     */
    const setTodayDate = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    };

    /**
     * 文字数カウントと応援メッセージ
     */
    textInput.addEventListener('input', () => {
        const len = textInput.value.length;
        charCount.textContent = len;

        if (len > 50) {
            praiseMessage.textContent = 'たくさん書けてえらい！💖';
        } else if (len > 20) {
            praiseMessage.textContent = 'いい感じ！✨';
        } else {
            praiseMessage.textContent = '';
        }
    });

    /**
     * 保存して描画
     */
    const saveAndRender = () => {
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('puri-diary-entries', JSON.stringify(entries));
        renderEntries();
    };

    /**
     * 日記を描画
     */
    const renderEntries = () => {
        entriesContainer.innerHTML = '';

        if (entries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-state" style="text-align:center; padding: 3rem; opacity: 0.6;">
                    <i class="fas fa-sparkles" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem; display: block;"></i>
                    <p>まだ日記がないよ。<br>きょうの まほうを かけてみて！</p>
                </div>
            `;
            return;
        }

        entries.forEach(entry => {
            const dateObj = new Date(entry.date);
            const formattedDate = dateObj.toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
            });

            const card = document.createElement('div');
            card.className = 'entry-card';
            
            // 気分アイコンの取得（古いデータへの互換性のためデフォルトをセット）
            const moodIcon = moodIcons[entry.mood] || '😊';

            card.innerHTML = `
                <div class="entry-header">
                    <div class="entry-date-mood">
                        <span class="entry-mood-display">${moodIcon}</span>
                        <span class="entry-date">${formattedDate}</span>
                    </div>
                    <button class="delete-btn" aria-label="削除" data-id="${entry.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="entry-content">${escapeHTML(entry.text)}</div>
            `;

            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('この日記をけしちゃう？')) {
                    entries = entries.filter(item => item.id !== id);
                    saveAndRender();
                }
            });

            entriesContainer.appendChild(card);
        });
    };

    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // フォーム送信
    diaryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const mood = document.querySelector('input[name="mood"]:checked').value;

        const newEntry = {
            id: Date.now().toString(),
            date: dateInput.value,
            mood: mood,
            text: textInput.value.trim()
        };

        if (!newEntry.text) return;

        entries.push(newEntry);
        saveAndRender();

        // リセット
        textInput.value = '';
        charCount.textContent = '0';
        praiseMessage.textContent = '';
        
        // 保存時にちょっとした演出（任意）
        const btn = document.querySelector('.submit-btn');
        btn.innerHTML = '<i class="fas fa-magic"></i> ほぞんしたよ！';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-cloud"></i> まほうの ほぞん';
        }, 2000);
    });

    // 初期化
    createStars();
    setTodayDate();
    renderEntries();
});
