# Gmail Text Part Viewer

GmailでメールのテキストパートとHTMLパートを切り替えて表示するChrome拡張機能です。

## 機能

- Gmailで開いているメールのHTML表示とテキスト表示を簡単に切り替え
- テキストパートがない場合は、HTMLからテキストを抽出して表示
- 画像はaltテキストに置換
- リンクはテキストとURLを表示

## インストール方法

1. このディレクトリ全体をダウンロード/クローン
2. アイコンファイルを作成：
   - `create_simple_icons.html`をブラウザで開く
   - 各キャンバスを右クリックして「画像として保存」
   - `icons`フォルダに`icon16.png`、`icon48.png`、`icon128.png`として保存
3. Chromeで`chrome://extensions/`を開く
4. 右上の「デベロッパーモード」をONにする
5. 「パッケージ化されていない拡張機能を読み込む」をクリック
6. このディレクトリを選択

## 使い方

1. Gmailでメールを開く
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