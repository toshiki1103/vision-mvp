document.addEventListener('DOMContentLoaded', () => {
  const titleDisplay = document.getElementById('page-title');
  const memoInput = document.getElementById('memo-input');
  const saveBtn = document.getElementById('save-btn');
  const status = document.getElementById('status');

  // 現在のタブ情報を取得して表示
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    titleDisplay.textContent = currentTab.title.substring(0, 40) + "...";
    
    saveBtn.addEventListener('click', () => {
      const memoText = memoInput.value;
      const newEntry = {
        text: memoText,
        title: currentTab.title,
        url: currentTab.url,
        date: new Date().toLocaleDateString()
      };

      // 保存処理 (既存のメモ配列に追加)
      chrome.storage.local.get(['memos'], (result) => {
        const memos = result.memos || [];
        memos.push(newEntry);
        
        chrome.storage.local.set({ memos: memos }, () => {
          status.textContent = "保存しました！";
          memoInput.value = "";
          setTimeout(() => window.close(), 1000);
        });
      });
    });
  });
});