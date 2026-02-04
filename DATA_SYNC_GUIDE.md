# 資料同步指南 (Data Sync Guide)

本專案已完成真實資料來源串接，包括美國經濟指標（FRED API）和台灣景氣指標（國發會開放資料）。

## 📊 資料來源

### 美國經濟指標
- **來源**: FRED (Federal Reserve Economic Data)
- **API**: https://fred.stlouisfed.org/
- **更新頻率**: 每月
- **指標數量**: 7 個（領先、同時、落後指標）

### 台灣景氣指標
- **來源**: 國家發展委員會 - 政府資料開放平臺
- **API**: https://data.nat.gov.tw/dataset/6099
- **更新頻率**: 每月
- **指標數量**: 12 個（領先、同時、落後指標 + 景氣對策信號）

## 🚀 手動同步資料

### 方法 1: 使用 API 端點

啟動開發伺服器後，訪問以下 URL：

```bash
# 同步美國指標
http://localhost:3000/api/sync

# 同步台灣指標
http://localhost:3000/api/sync-taiwan
```

### 方法 2: 使用同步腳本

```bash
# 確保開發伺服器正在運行
pnpm dev

# 在另一個終端執行同步腳本
./scripts/sync-all.sh
```

## ⏰ 自動定期更新

本專案使用 GitHub Actions 實現自動定期更新：

### 設定步驟

1. **設定 GitHub Secrets**

   在 GitHub 倉庫設定中新增以下 Secrets：
   
   - `DATABASE_URL`: 資料庫連線字串（例如：`file:./dev.db`）
   - `APP_URL`: 應用程式 URL（例如：`https://your-app.vercel.app`）
   - `SYNC_SECRET`: 同步 API 的密鑰（可選，用於保護 API）
   - `FRED_API_KEY`: FRED API 金鑰

2. **啟用 GitHub Actions**

   GitHub Actions workflow 已設定在 `.github/workflows/sync-data.yml`
   
   - **自動執行**: 每天 UTC 10:00 (台灣時間 18:00)
   - **手動觸發**: 可在 GitHub Actions 頁面手動執行

3. **查看執行狀態**

   前往 GitHub 倉庫的 `Actions` 頁面查看執行記錄

## 🔧 本地開發

### 初次設定

```bash
# 1. 安裝依賴
pnpm install

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env 並填入 FRED_API_KEY

# 3. 初始化資料庫
pnpm exec prisma migrate dev
pnpm exec prisma generate

# 4. 執行 seed（建立初始指標）
npx tsx prisma/seed.ts
npx tsx prisma/seed-taiwan.ts

# 5. 啟動開發伺服器
pnpm dev

# 6. 同步真實資料
./scripts/sync-all.sh
```

### 資料庫管理

```bash
# 查看資料庫內容
pnpm exec prisma studio

# 重置資料庫
pnpm exec prisma migrate reset

# 重新執行 seed
npx tsx prisma/seed.ts
npx tsx prisma/seed-taiwan.ts
```

## 📝 技術實作細節

### 美國指標同步流程

1. `FredFetcher` 從 FRED API 抓取最新 24 個月的資料
2. `SyncService` 將資料寫入 SQLite 資料庫
3. 前端從資料庫讀取並顯示

### 台灣指標同步流程

1. `TaiwanFetcher` 從國發會開放資料平臺下載 ZIP 檔案
2. 解壓縮並解析 CSV 檔案
3. `SyncService` 將資料寫入 SQLite 資料庫
4. 前端從資料庫讀取並顯示

### 資料快取機制

- `TaiwanFetcher` 實作了記憶體快取（TTL: 1 小時）
- 避免重複下載大型 ZIP 檔案
- 提升同步效率

## 🐛 故障排除

### 問題：FRED API 回傳錯誤

**解決方案**:
1. 檢查 `.env` 中的 `FRED_API_KEY` 是否正確
2. 確認 API Key 沒有超過使用限制
3. 檢查網路連線

### 問題：台灣資料下載失敗

**解決方案**:
1. 確認政府開放資料平臺服務正常
2. 檢查網路連線
3. 查看錯誤日誌了解詳細原因

### 問題：資料庫鎖定錯誤

**解決方案**:
```bash
# 停止所有 Node.js 程序
pkill -f node

# 刪除資料庫鎖定檔案
rm dev.db-journal

# 重新啟動
pnpm dev
```

## 📚 相關文件

- [FRED API 文件](https://fred.stlouisfed.org/docs/api/fred/)
- [政府資料開放平臺](https://data.gov.tw/)
- [Prisma 文件](https://www.prisma.io/docs)
- [GitHub Actions 文件](https://docs.github.com/en/actions)

## 🎯 未來改進方向

1. **增量更新**: 只更新新增的資料點，而非全部重新下載
2. **錯誤通知**: 當同步失敗時發送通知（Email/Slack）
3. **資料驗證**: 檢查資料完整性和異常值
4. **更多資料來源**: 整合更多國家和地區的經濟指標
5. **API 保護**: 為同步 API 增加認證機制
