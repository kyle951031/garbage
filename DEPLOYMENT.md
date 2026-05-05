# 🚀 GitHub Pages 部署指南

## 方法 1: 自動部署 (推薦)

### 步驟 1: 確保 GitHub Pages 已啟用
1. 進入你的倉庫 (https://github.com/你的用戶名/garbage)
2. 點擊上方的 **Settings** 選項卡
3. 在左側邊欄找到 **Pages**
4. 在 "Build and deployment" 部分:
   - Source: 選擇 "GitHub Actions"
   - (如果看到"Deploy from a branch"，選擇後選擇 "main" 分支)
5. 點擊 **Save**

### 步驟 2: 檢查自動部署
1. 進入 **Actions** 選項卡
2. 你會看到 "Deploy to GitHub Pages" 工作流
3. 等待綠色 ✅ 標記表示部署完成

### 步驟 3: 訪問你的應用
```
https://你的用戶名.github.io/garbage/
```

---

## 方法 2: 手動推送到 `gh-pages` 分支

### 步驟 1: 創建 gh-pages 分支
```bash
# 克隆倉庫
git clone https://github.com/你的用戶名/garbage.git
cd garbage

# 創建並切換到 gh-pages 分支
git checkout --orphan gh-pages

# 清空所有文件（除了 .git）
git rm -rf .

# 從 main 分支複製所有文件
git checkout main -- .

# 提交並推送
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

### 步驟 2: 配置 GitHub Pages
1. Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: "gh-pages" / root
4. 點擊 **Save**

### 步驟 3: 訪問應用
```
https://你的用戶名.github.io/garbage/
```

---

## 方法 3: 子目錄部署

如果想部署到根目錄而不是 `/garbage/` 子目錄:

### 選項 A: 通過分支提交
```bash
git checkout gh-pages
# 複製所有相關文件到根目錄
cp -r * /tmp/garbage
git rm -rf .
cp -r /tmp/garbage/* .
git add .
git commit -m "Deploy at root"
git push origin gh-pages
```

### 選項 B: 修改建置腳本
編輯 `.github/workflows/deploy.yml`:
```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v1
  with:
    path: '.'  # 改為 '.' 表示根目錄
```

---

## ✅ 驗證部署

部署完成後，檢查以下項目:

```bash
# 檢查 index.html 是否可訪問
curl https://你的用戶名.github.io/garbage/index.html

# 檢查模型文件
curl -I https://你的用戶名.github.io/garbage/model.json
curl -I https://你的用戶名.github.io/garbage/weights.bin

# 檢查 JavaScript 文件
curl -I https://你的用戶名.github.io/garbage/script.js
```

---

## 🔧 故障排查

| 問題 | 解決方案 |
|------|--------|
| 404 Not Found | 檢查文件是否真的推送到了 GitHub |
| CSS/JS 未加載 | 清除瀏覽器緩存 (Ctrl+Shift+Delete) |
| 模型加載失敗 | 檢查 `model.json` 和 `weights.bin` 是否存在 |
| 攝像頭無法啟動 | 需要 HTTPS 連接（GitHub Pages 自動提供） |

---

## 📊 部署統計

| 項目 | 大小 |
|-----|------|
| HTML | ~15 KB |
| CSS | ~12 KB |
| JavaScript | ~8 KB |
| Model JSON | ~90 KB |
| Weights | ~2.1 MB |
| **總計** | **~2.2 MB** |

> 💡 首次加載只需下載 2.2 MB，之後完全離線運行

---

## 🎯 最佳實踐

1. ✅ 使用自動部署工作流 (GitHub Actions)
2. ✅ 定期測試 https://你的用戶名.github.io/garbage/
3. ✅ 保持 `main` 分支整潔
4. ✅ 在 `matadata.json` 中記錄模型信息
5. ✅ 為大文件使用 Git LFS (如果 weights.bin > 100MB)

---

## 🚀 進階選項

### 使用自定義域名

```bash
# 1. 在 DNS 上配置 CNAME 記錄指向:
# your-domain.com  CNAME  your-username.github.io

# 2. 在倉庫設置中添加自定義域名
# Settings → Pages → Custom domain → 輸入 your-domain.com

# 3. GitHub 會自動創建 CNAME 文件
```

### 啟用 HTTPS

- GitHub Pages 自動提供 HTTPS
- 可在 Settings → Pages 中強制使用 HTTPS

### 發布到多個平台

```bash
# Netlify 部署
npm install -g netlify-cli
netlify deploy --prod --dir .

# Vercel 部署  
npm install -g vercel
vercel --prod

# Firebase 部署
npm install -g firebase-tools
firebase deploy --only hosting
```

---

需要幫助? 查看 [GitHub Pages 官方文檔](https://docs.github.com/en/pages)
