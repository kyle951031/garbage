# 🗑️ 垃圾分類識別器 (Garbage Classification Identifier)

完全**前端**的垃圾分類 AI 應用•零後端•隱私優先

## 🚀 快速開始

### 本地運行

```bash
# 進入項目目錄
cd /workspaces/garbage

# 使用 GitHub Pages 或靜態站點託管 (無需後端)
# 例如：將檔案推送到 GitHub 並啟用 Pages
```

訪問: https://<你的用戶名>.github.io/garbage/

### GitHub Pages 部署

1. **Fork 或 Clone 此倉庫**
   ```bash
   git clone https://github.com/kyle951031/garbage.git
   cd garbage
   ```

2. **推送到 GitHub**
   ```bash
   git push origin main
   ```

3. **配置 GitHub Pages**
   - 進入你的倉庫設置 (Settings)
   - 找到 "Pages" 部分
   - Source 選擇: "Deploy from a branch"
   - Branch 選擇: "main" / root
   - 點擊 "Save"

4. **訪問你的應用**
   - URL: `https://<你的GitHub用戶名>.github.io/garbage/`

## ✨ 功能特性

- 📷 **實時攝像頭識別** - 即時瀝玻璃、垃圾和紙張
- 📁 **圖片上傳分類** - 支持本地圖片分析
- 🔒 **完全隱私** - 所有運算在瀏覽器本地進行，無服務器
- 🌙 **暗黑模式** - 自動適應系統主題
- 📱 **完全響應式** - 桌面•平板•手機完美支持
- ⚡ **離線運行** - 加載後無需網絡連接

## 🛠️ 技術棧

| 組件 | 技術 |
|------|------|
| 前端 | 純 HTML5 + CSS3 + JavaScript |
| AI 引擎 | TensorFlow.js + Teachable Machine |
| 模型 | MobileNet V2 |
| 部署 | GitHub Pages (靜態託管) |
| 伺服器 | ❌ 無 (完全靜態) |

## 📋 垃圾分類標準

| 分類 | 符號 | 示例 |
|------|------|------|
| 🔵 玻璃 | Glass | 玻璃瓶、玻璃杯、玻璃器皿 |
| 🟫 垃圾 | Trash | 一般廢棄物、塑料、金屬 |
| 📄 紙張 | Paper | 紙盒、紙張、紙板 |

## 📦 項目結構

```
garbage/
├── index.html          # UI 界面
├── script.js           # 核心邏輯 (攝像頭、預測)
├── styles.css          # 完整樣式 (響應式 + 暗黑模式)
├── model.json          # TensorFlow.js 模型定義
├── metadata.json       # 模型元數據
├── weights.bin         # 模型權重
├── .github/workflows/  # GitHub Actions 自動部署
└── README.md           # 本文件
```

## 🔧 環境要求

- 現代瀏覽器 (Chrome/Firefox/Safari/Edge)
- 攝像頭 (可選，僅用於實時識別)
- 網絡連接 (初次加載模型時)

## 🎯 使用方式

### 1️⃣ 攝像頭識別
1. 點擊 "📷 攝像頭" 標籤
2. 點擊 "🎥 啟動攝像頭"
3. 將垃圾對準攝像頭
4. 應用自動識別並顯示分類結果

### 2️⃣ 圖片上傳
1. 點擊 "📁 上傳圖片" 標籤
2. 拖拽或點擊選擇垃圾照片
3. 確認預覽後點擊 "🔍 開始分類"
4. 查看分類結果和置信度

### 3️⃣ 幫助信息
1. 點擊 "ℹ️ 幫助" 標籤查看詳細指導

## 📊 模型信息

- **架構**: MobileNet V2
- **輸入尺寸**: 224×224 像素
- **輸出類別**: 3 (glass, trash, paper)
- **模型大小**: ~2.1 MB
- **推理時間**: 100-300ms (取決於設備)

## ⚠️ 注意事項

✅ **為最佳結果:**
- 確保光線充足
- 物體應清晰可見
- 一次只識別單個物體
- 讓攝像頭穩定幾秒鐘

❌ **已知限制:**
- 可能在極端光線下出現誤判
- 相似形狀物體可能難以區分
- 識別速度取決於設備計算能力

## 🚀 部署變種

### Azure Static Web Apps
```bash
az staticwebapp create \
  --resource-group <group> \
  --name garbage-classifier \
  --source https://github.com/kyle951031/garbage
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir .
```

### Vercel
```bash
npm install -g vercel
vercel --prod
```

## 📜 許可證

MIT License

## 🌟 貢獻

歡迎提 Issues 和 Pull Requests !

---

**完全前端應用** • 無後端依賴 • 隱私至上 ♻️