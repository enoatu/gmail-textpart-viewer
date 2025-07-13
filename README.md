# Gmail Text Part Viewer

GmailでメールのテキストパートとHTMLパートを切り替えて表示するChrome拡張機能です。

<img width="1419" height="679" alt="スクリーンショット 2025-07-13 12 22 49" src="https://github.com/user-attachments/assets/5ac8194e-c18f-4a93-8b93-de6bdc94cfc1" />


## 機能

- Gmailで開いているメールのHTML表示とテキスト表示を簡単に切り替え
- テキストパートがない場合は、HTMLからテキストを抽出して表示
- 画像はaltテキストに置換
- リンクはテキストとURLを表示

## インストール方法

1. このディレクトリ全体をダウンロード/クローン
2. Chromeで`chrome://extensions/`を開く
3. 右上の「デベロッパーモード」をONにする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. このディレクトリを選択

## 使い方

1. Gmailでメールを開き、「原文を表示」をクリック
2. 拡張機能のアイコンをクリックしてポップアップを開く
3. トグルスイッチでHTML/Text表示を切り替え

## ファイル構成

```
gmail-textpart-viewer/
├── manifest.json          # 拡張機能の設定
├── popup.html            # ポップアップUI
├── src/
│   ├── popup.js          # ポップアップのスクリプト
│   ├── content.js        # Gmailページで動作するスクリプト
│   └── background.js     # バックグラウンドスクリプト
├── icons/                # アイコンファイル
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # このファイル
```

## 注意事項

- Gmailの仕様変更により動作しなくなる可能性があります
- プライベートなメール内容を扱うため、セキュリティに注意してください
