# 真實數據串接指南 (Real Data Integration Guide)

本文件說明如何將此平台串接至真實的外部 API (如 FRED、Alpha Vantage、Yahoo Finance 等)，並實現自動化數據更新。

## 1. 架構總覽

我們採用 **"Fetcher-Sync Pattern"** 設計：

1.  **Fetcher (Interface)**: 定義統一的數據獲取介面。
2.  **Concrete Implementation**: 針對不同來源實作 Fetcher (例如 `FredFetcher`, `YahooFetcher`)。
3.  **Sync Service**: 負責協調 Fetcher 抓取數據，並透過 Prisma 寫入資料庫。
4.  **API Route**: 提供一個 HTTP Endpoint (`/api/sync`) 供外部排程器 (Cron Job) 觸發。

## 2. 實作步驟

### 步驟 A: 實作真實的 Fetcher

請參考 `lib/services/mock-fetcher.ts`，建立一個新的檔案 `lib/services/fred-fetcher.ts`：

```typescript
// lib/services/fred-fetcher.ts
import { DataFetcher, FetchedDataPoint } from "./fetcher";

const API_KEY = process.env.FRED_API_KEY;

export class FredFetcher implements DataFetcher {
  async fetchData(seriesId: string): Promise<FetchedDataPoint[]> {
    // 1. 呼叫真實 API
    const url = \`https://api.stlouisfed.org/fred/series/observations?series_id=\${seriesId}&api_key=\${fa375891a1a6cc05010ffa41d4ff2eee}&file_type=json\`;
    const res = await fetch(url);
    const json = await res.json();

    // 2. 轉換資料格式
    return json.observations.map((obs: any) => ({
      date: new Date(obs.date).toISOString(),
      value: parseFloat(obs.value),
    }));
  }

  getProviderName() { return "FRED API"; }
}
```

### 步驟 B: 設定環境變數

在 `.env` 檔案中加入您的 API Key：

```env
DATABASE_URL="file:./dev.db"
FRED_API_KEY="your_api_key_here"
```

### 步驟 C: 啟用新的 Fetcher

修改 `app/api/sync/route.ts`，將 Mock Fetcher 替換為剛寫好的 Real Fetcher：

```typescript
// app/api/sync/route.ts
import { FredFetcher } from "@/lib/services/fred-fetcher"; // Import new fetcher

export async function GET() {
  // ...
  const fetcher = new FredFetcher(); // Use real fetcher
  const syncer = new SyncService(fetcher);
  // ...
}
```

### 步驟 D: 設定指標對應 (Mapping)

在 `lib/services/sync-service.ts` 中，確認 `SOURCE_MAP` 正確對應您的資料庫代碼 (Code) 與外部 API 的 ID (Series ID)：

```typescript
const SOURCE_MAP: Record<string, string> = {
  "pmi": "ISM/MAN_PMI", 
  "cpi": "CPIAUCSL", // FRED Series ID for CPI
  // ...
};
```

## 3. 自動化更新 (Automation)

您可以透過以下方式定期觸發數據更新：

1.  **Vercel Cron**: 在 `vercel.json` 設定 Cron Job 呼叫 `/api/sync`。
2.  **GitHub Actions**: 寫一個 workflow 定期 `curl https://your-site.com/api/sync`。
3.  **手動觸發**: 直接在瀏覽器訪問 `http://localhost:3000/api/sync`。

## 4. 前端顯示

前端元件 (`IndicatorList`, `IndicatorDetailDialog`) 是直接讀取資料庫的 `IndicatorValue` 表。
一旦 `/api/sync` 成功寫入新數據到資料庫，前端重整後即可自動顯示最新圖表，**無需修改任何前端程式碼**。
