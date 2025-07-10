// 原文表示ページでText Partをデコードして表示
console.log('[Gmail Text Part Viewer] Raw content script loaded');
console.log('[Gmail Text Part Viewer] Current URL:', window.location.href);
console.log('[Gmail Text Part Viewer] Page title:', document.title);

// デコード関数
function decodeQuotedPrintable(str) {
  // ソフトラインブレークを削除
  str = str.replace(/=\r?\n/g, '');
  
  // =XX形式を一旦バイト配列に変換
  const bytes = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === '=' && i + 2 < str.length) {
      const hex = str.substr(i + 1, 2);
      if (/^[0-9A-F]{2}$/i.test(hex)) {
        bytes.push(parseInt(hex, 16));
        i += 3;
        continue;
      }
    }
    // 通常の文字はそのままバイトとして扱う
    bytes.push(str.charCodeAt(i));
    i++;
  }
  
  // バイト配列をUTF-8としてデコード
  try {
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch (e) {
    console.error('[Gmail Text Part Viewer] Quoted-printable decode error:', e);
    // フォールバック: 各バイトを文字として扱う
    return bytes.map(b => String.fromCharCode(b)).join('');
  }
}

function decodeBase64(str) {
  try {
    // Base64デコード後、UTF-8としてデコード
    const binary = atob(str.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('Base64 decode error:', e);
    return str;
  }
}

// MIMEパートを解析
function parseMimeParts(rawText) {
  const parts = [];
  const boundaryMatch = rawText.match(/boundary="?([^"\s]+)"?/i);
  
  if (!boundaryMatch) {
    return [{ content: rawText, headers: {} }];
  }
  
  const boundary = boundaryMatch[1];
  const sections = rawText.split(new RegExp(`--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  
  for (const section of sections) {
    if (section.trim() === '' || section.trim() === '--') continue;
    
    const headerEndIndex = section.search(/\r?\n\r?\n/);
    if (headerEndIndex === -1) continue;
    
    const headerSection = section.substring(0, headerEndIndex);
    const content = section.substring(headerEndIndex).trim();
    
    const headers = {};
    const headerLines = headerSection.split(/\r?\n/);
    let currentHeader = '';
    
    for (const line of headerLines) {
      if (line.match(/^\s/) && currentHeader) {
        // 継続行
        headers[currentHeader] += ' ' + line.trim();
      } else {
        const headerMatch = line.match(/^([^:]+):\s*(.*)$/);
        if (headerMatch) {
          currentHeader = headerMatch[1].toLowerCase();
          headers[currentHeader] = headerMatch[2];
        }
      }
    }
    
    parts.push({ headers, content });
  }
  
  return parts;
}

// Text Partを抽出してデコード
function extractAndDecodeTextPart(rawText) {
  const parts = parseMimeParts(rawText);
  const textParts = [];
  
  for (const part of parts) {
    const contentType = part.headers['content-type'] || '';
    
    if (contentType.includes('text/plain')) {
      let decodedContent = part.content;
      
      // Content-Transfer-Encodingをチェック
      const encoding = part.headers['content-transfer-encoding'];
      if (encoding) {
        if (encoding.toLowerCase().includes('quoted-printable')) {
          decodedContent = decodeQuotedPrintable(decodedContent);
        } else if (encoding.toLowerCase().includes('base64')) {
          decodedContent = decodeBase64(decodedContent);
        }
      }
      
      // 文字コードを確認
      const charsetMatch = contentType.match(/charset=["']?([^"'\s;]+)/i);
      if (charsetMatch && charsetMatch[1].toLowerCase() !== 'utf-8') {
        console.log('Charset:', charsetMatch[1]);
      }
      
      textParts.push({
        content: decodedContent,
        encoding: encoding || 'none',
        charset: charsetMatch ? charsetMatch[1] : 'utf-8'
      });
    }
  }
  
  return textParts;
}

// UIを作成
function createUI() {
  const container = document.createElement('div');
  container.id = 'text-part-viewer';
  container.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 10px;
    max-width: 90%;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: sans-serif;
  `;
  
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  `;
  
  const title = document.createElement('h3');
  title.textContent = 'Text Part Viewer';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
  `;
  closeButton.onclick = () => container.remove();
  
  header.appendChild(title);
  header.appendChild(closeButton);
  container.appendChild(header);
  
  return container;
}

// Text Partを表示
function displayTextParts(textParts) {
  const container = createUI();
  
  if (textParts.length === 0) {
    const message = document.createElement('p');
    message.textContent = 'Text Partが見つかりませんでした。';
    message.style.color = '#666';
    container.appendChild(message);
  } else {
    textParts.forEach((part, index) => {
      const partContainer = document.createElement('div');
      partContainer.style.cssText = `
        margin-bottom: 20px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 4px;
      `;
      
      const info = document.createElement('div');
      info.style.cssText = `
        font-size: 12px;
        color: #666;
        margin-bottom: 10px;
      `;
      info.textContent = `Part ${index + 1} - Encoding: ${part.encoding}, Charset: ${part.charset}`;
      
      const content = document.createElement('pre');
      content.style.cssText = `
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
        padding: 10px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: monospace;
        font-size: 14px;
        line-height: 1.5;
      `;
      content.textContent = part.content;
      
      partContainer.appendChild(info);
      partContainer.appendChild(content);
      container.appendChild(partContainer);
    });
  }
  
  // 既存のビューアがあれば削除
  const existing = document.getElementById('text-part-viewer');
  if (existing) {
    existing.remove();
  }
  
  document.body.appendChild(container);
}

// ボタンを追加
function addViewButton() {
  // 既にボタンがある場合はスキップ
  if (document.getElementById('text-part-viewer-button')) {
    console.log('[Gmail Text Part Viewer] Button already exists');
    return;
  }
  
  const button = document.createElement('button');
  button.id = 'text-part-viewer-button';
  button.textContent = 'View Text Part';
  button.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    padding: 8px 16px;
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    z-index: 10000;
  `;
  
  button.onclick = () => {
    const rawText = document.body.textContent;
    const textParts = extractAndDecodeTextPart(rawText);
    displayTextParts(textParts);
  };
  
  document.body.appendChild(button);
}

// URLパターンのチェック
function isRawMessagePage() {
  const url = window.location.href;
  const isRawPage = url.includes('view=om') || url.includes('#view=om');
  console.log('[Gmail Text Part Viewer] Is raw message page:', isRawPage);
  console.log('[Gmail Text Part Viewer] URL details:', {
    href: url,
    search: window.location.search,
    hash: window.location.hash
  });
  return isRawPage;
}

// ページが読み込まれたら実行
function initialize() {
  console.log('[Gmail Text Part Viewer] Initializing...');
  
  if (isRawMessagePage()) {
    console.log('[Gmail Text Part Viewer] Raw message page detected, adding view button');
    addViewButton();
    
    // ページ内容の確認
    console.log('[Gmail Text Part Viewer] Page content preview:', 
      document.body.textContent.substring(0, 200));
  } else {
    console.log('[Gmail Text Part Viewer] Not a raw message page, skipping');
  }
}

// DOMContentLoadedとタイマーの両方で試行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // 既に読み込まれている場合
  setTimeout(initialize, 100);
}

// 念のため遅延実行も追加
setTimeout(() => {
  if (!document.getElementById('text-part-viewer-button') && isRawMessagePage()) {
    console.log('[Gmail Text Part Viewer] Retry: Adding view button');
    initialize();
  }
}, 2000);