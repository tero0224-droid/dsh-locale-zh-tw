# dsh-locale-zh-tw

[![ci](https://github.com/tero0224-droid/dsh-locale-zh-tw/actions/workflows/ci.yml/badge.svg)](https://github.com/tero0224-droid/dsh-locale-zh-tw/actions/workflows/ci.yml)

[English](README.md) · 繁體中文

給 [DeepSeek Harness](https://github.com/deepseek-ai) 網頁介面用的繁體中文（台灣）語言套件。

DeepSeek Harness 內建八種介面語言——英文、簡體中文、日文、西班牙文、法文、德文、俄文與巴西葡萄牙文。這個套件把 **繁體中文** 加進清單，而且不需要搬運數千條翻譯字串：查詢字串的當下，它把已安裝的簡體中文字典轉成台灣正體，因此官方日後新增的介面文字、以及你之後安裝的外掛都會自動涵蓋。

## 安裝

```sh
# 從 GitHub 安裝
dsh plugin --profile <profile> add github:tero0224-droid/dsh-locale-zh-tw

# 或從本機目錄安裝
dsh plugin --profile <profile> add /absolute/path/to/dsh-locale-zh-tw
```

在 DSH Desktop 也可以用 **外掛（Plugins）→ 新增外掛 → 本機目錄** 安裝一份 checkout。裝完請重啟 DSH 一次，bundle 是在啟動時組進去的。

需要 DSH `>= 0.2.1`（`ctx.locale.addLanguage` / `ctx.locale.register` 的語言套件 API）。

## 使用

**設定 → 一般 → 語言 → 繁體中文**。選完立刻生效，並以 `locale.preference` 保存，之後開新工作階段就是繁體中文。

## 運作方式

- 以 `ctx.locale.addLanguage({ id: 'zh-TW', label: '繁體中文', fallback: 'zh' })` 註冊語言；套件裡沒有的鍵會退回簡體中文，而不是英文。
- 對 locale runtime 目前已持有的每個命名空間，註冊一份惰性的 `zh-TW` 字典。讀取某個鍵時才把內建的 `zh` 字串轉成正體，因此字典來源仍然只有一份。
- 以短週期的輪詢同步，補上啟動後才由其他外掛註冊的命名空間。
- 轉換表在建置時由 OpenCC（`s2twp`）產生——**2,644 個字 ＋ 114 條介面用語**——並內嵌在 `client.js`。沒有執行期依賴、不連網、不產生額外的模型請求。

## 已知限制

- 在繪製路徑之外、於註冊當下就固定的字串（例如指令說明），會保持註冊時的語言，直到重新註冊為止。這是 locale 服務本身的限制。
- 規則式轉換在「一個簡體詞對應多個台灣用語」時，可能選到不夠貼切的詞。回報這類案例即可擴充詞表。
- 本套件會讀取 locale runtime 內部的 `dicts` 對照表。若未來 DSH 版本改變該結構，套件需要小幅更新。
- 並非每個產品字串都存在於簡體字典中；這些鍵會退回英文或鍵名本身，與其他語言的行為相同。

## 開發

```sh
cd tools
npm install          # opencc-js，僅建置時需要
node build.mjs       # 由 tools/client.template.js 重新產生 ../client.js
node smoke.mjs       # 以假的 locale runtime 驗證語言、字典與轉換結果
```

`tools/client.template.js` 是執行期程式碼，`build.mjs` 負責把產生的字元／詞語表注入。要擴充用語，編輯 `build.mjs` 裡的 `overrides` 清單後重新建置。

## 授權

MIT — 見 [LICENSE](LICENSE)。
