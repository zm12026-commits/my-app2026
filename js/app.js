/**
 * Simple Diary - main logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 状態管理
    let entries = JSON.parse(localStorage.getItem('diary-entries')) || [];

    // DOM要素
    const diaryForm = document.getElementById('diary-form');
    const dateInput = document.getElementById('date-input');
    const textInput = document.getElementById('text-input');
    const entriesContainer = document.getElementById('entries-container');

    /**
     * 今日の日付を初期値としてセット
     */
    const setTodayDate = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    };

    /**
     * 日記を保存して画面を更新
     */
    const saveAndRender = () => {
        // 日付順に並び替え
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        // localStorageに保存
        localStorage.setItem('diary-entries', JSON.stringify(entries));
        // 描画
        renderEntries();
    };

    /**
     * 日記を描画
     */
    const renderEntries = () => {
        entriesContainer.innerHTML = '';

        if (entries.length === 0) {
            entriesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-feather-alt"></i>
                    <p>まだ日記がありません。<br>今日のできごとを書いてみましょう。</p>
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
            card.innerHTML = `
                <div class="entry-header">
                    <div class="entry-date">
                        <i class="far fa-calendar-check"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <button class="delete-btn" aria-label="削除" data-id="${entry.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
                <div class="entry-content">${escapeHTML(entry.text)}</div>
            `;

            // 削除ボタンのイベント
            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                deleteEntry(id);
            });

            entriesContainer.appendChild(card);
        });
    };

    /**
     * 日記を削除
     */
    const deleteEntry = (id) => {
        if (confirm('この日記を削除してもよろしいですか？')) {
            entries = entries.filter(entry => entry.id !== id);
            saveAndRender();
        }
    };

    /**
     * HTMLエスケープ（XSS対策）
     */
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // フォーム送信
    diaryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newEntry = {
            id: Date.now().toString(),
            date: dateInput.value,
            text: textInput.value.trim()
        };

        if (!newEntry.text) return;

        entries.push(newEntry);
        saveAndRender();

        // フォームをリセット（日付は残す）
        textInput.value = '';
    });

    // 初期化
    setTodayDate();
    renderEntries();
});
