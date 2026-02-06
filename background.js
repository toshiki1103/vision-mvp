// インストール・更新時にメニューを作成
chrome.runtime.onInstalled.addListener(() => {
  // 重複エラーを防ぐために一旦削除
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-to-vision",
      title: "Visionに保存",
      contexts: ["selection", "page"] // "page" を追加：何も選択してなくても出るようにする
    });
  });
});

// クリック時の処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-vision") {
    // 選択テキストがあればそれを使う。なければページタイトルを使う。
    const text = info.selectionText ? info.selectionText : `[Page] ${tab.title}`;
    const title = tab.title;
    const url = tab.url;

    chrome.storage.local.get(['memos'], (result) => {
      const memos = result.memos || [];
      memos.push({
        text: text,
        title: title,
        url: url,
        date: new Date().toLocaleDateString()
      });

      chrome.storage.local.set({ memos: memos }, () => {
        console.log("Saved!");
        // 保存成功の証として、アイコンに「OK」バッジを一瞬出す演出
        chrome.action.setBadgeText({text: "OK"});
        chrome.action.setBadgeBackgroundColor({color: "#4CAF50"});
        setTimeout(() => chrome.action.setBadgeText({text: ""}), 1500);
      });
    });
  }
});