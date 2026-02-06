document.addEventListener('DOMContentLoaded', () => {
  // --- 時計機能 ---
  const clockElement = document.getElementById('clock-area');
  const updateClock = () => {
    const now = new Date();
    // 時間を 09:05 のように2桁埋めで表示
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}`;
  };
  setInterval(updateClock, 1000); // 1秒ごとに更新
  updateClock(); // 即時実行

  // --- 設定読み込み (前回と同じ) ---
  const goalDisplay = document.getElementById('goal-display');
  const goalInput = document.getElementById('goal-input');
  const bgInput = document.getElementById('bg-input');
  const saveSettingsBtn = document.getElementById('save-settings');

  chrome.storage.local.get(['goal', 'bgImage'], (result) => {
    if (result.goal) {
      goalDisplay.textContent = result.goal;
      goalInput.value = result.goal;
    } else {
      goalDisplay.textContent = "Please set your goal ↗";
    }
    if (result.bgImage) {
      document.body.style.backgroundImage = `url('${result.bgImage}')`;
      bgInput.value = result.bgImage;
    } else {
      document.body.style.backgroundColor = "#222";
    }
  });

  saveSettingsBtn.addEventListener('click', () => {
    const goal = goalInput.value;
    const bgImage = bgInput.value;
    chrome.storage.local.set({ goal, bgImage }, () => location.reload());
  });

  // --- メモ機能 (下部表示 & トグル) ---
  const container = document.getElementById('footer-memo-container');
  const toggleBtn = document.getElementById('toggle-memo-btn');
  const memoContent = document.getElementById('memo-content');
  const memoSource = document.getElementById('memo-source');
  const deleteBtn = document.getElementById('delete-memo');
  const nextBtn = document.getElementById('next-memo');

  // トグル機能（表示/非表示）
  let isHidden = false;
  toggleBtn.addEventListener('click', () => {
    isHidden = !isHidden;
    if (isHidden) {
      container.classList.add('hidden');
      toggleBtn.textContent = "Show ⬆";
    } else {
      container.classList.remove('hidden');
      toggleBtn.textContent = "Hide ⬇";
    }
  });

  // メモ表示ロジック
  const showRandomMemo = (memos) => {
    if (!memos || memos.length === 0) {
      memoContent.textContent = "右クリックでメモを追加してみよう！";
      memoSource.style.display = 'none';
      return;
    }
    const randomIndex = Math.floor(Math.random() * memos.length);
    const item = memos[randomIndex];
    
    memoContent.textContent = item.text;
    memoSource.style.display = 'inline';
    memoSource.textContent = item.title ? `Source: ${item.title.substring(0,30)}...` : "Source";
    memoSource.href = item.url;

    // 削除ボタンの挙動更新（クロージャでindexを保持）
    deleteBtn.onclick = () => {
      if(confirm("このメモを削除しますか？")) {
        memos.splice(randomIndex, 1);
        chrome.storage.local.set({ memos: memos }, () => showRandomMemo(memos));
      }
    };
  };

  // データ取得して表示
  chrome.storage.local.get(['memos'], (result) => {
    const memos = result.memos || [];
    showRandomMemo(memos);

    // Nextボタンで別のメモを表示
    nextBtn.addEventListener('click', () => {
      showRandomMemo(memos);
    });
  });
});