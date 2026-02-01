# CycleSight - 景氣與投資進出場指標平台

這是一個基於 Next.js 14、TypeScript、Tailwind CSS 與 shadcn/ui 建構的現代化金融儀表板。
專案採用「深色玻璃擬態 (Glassmorphism)」設計風格，旨在協助投資人掌握總體經濟循環位階，並提供量化的進出場建議。

## 🎯 專案目標

1. **可視化景氣循環**：將複雜的總體經濟數據轉化為 0-100 的景氣分數，並標示當前週期 (擴張/衰退/復甦/轉折)。
2. **量化投資建議**：結合「景氣基本面」與「技術面趨勢」，提供明確的風險燈號與持股水位建議。
3. **極致 UI 體驗**：使用現代化的高質感玻璃風格，提供沉浸式的操作體驗。

## 🚀 主要功能與路由

- **景氣總覽 (Macro Dashboard)** - `/`
  - 核心景氣儀表板，顯示整體總經分數。
  - 領先、同步、落後指標的即時狀態監控。
  - 歷史回測圖表 (景氣分數 vs 市場指數)。

- **市場風險 (Market Timing)** - `/market`
  - 各大指數 (S&P 500, 台股, NASDAQ) 的風險位階評估。
  - 結合技術面的個股/指數進出場訊號。
  - 建議資產配置比例 (股票/現金)。

- **觀察清單 (Watchlist)** - `/watchlist`
  - 自訂關注標的清單。
  - 即時計算個股的進場評分與操作建議。

- **方法說明 (Methodology)** - `/methodology`
  - 完整揭露模型的評分邏輯與指標權重。
  - 景氣循環各階段的定義說明。

## 🛠 技術架構

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Charts**: Recharts
- **Theme**: Custom Glassmorphism System in `components/glass`

## 🏗️ 系統架構 (Architecture)

```mermaid
graph TD
    subgraph Frontend [Frontend (Next.js Client Components)]
        UI[Glass UI Library]
        Pages[Dashboard / Market / Watchlist]
        Charts[Recharts Visualization]
        Theme[Theme Provider (Dark/Light)]
    end

    subgraph Backend [Backend (Server Actions)]
        Action_Macro[Macro Score Engine]
        Action_Tech[Technical Engine]
        Action_Data[Data Fetching Actions]
    end

    subgraph DataLayer [Data Layer]
        Prisma[Prisma ORM]
        SQLite[(SQLite Database)]
        Mock[Mock Data Source]
    end

    UI --> Pages
    Pages --> Charts
    Theme --> UI
    
    Pages -- "Server Actions" --> Action_Data
    Action_Data --> Action_Macro
    Action_Data --> Action_Tech
    
    Action_Data -- "Read/Write" --> Prisma
    Prisma -- "Query" --> SQLite
    
    Action_Data -. "Fallback" .-> Mock
```

## 🔌 如何擴充真實數據 (Real API Integration)

目前專案使用 Mock Data 位於 `lib/data/` 目錄。若要串接真實數據 (如 FRED, Alpha Vantage, Yahoo Finance)，請依照以下步驟：

1. **實作 Data Fetcher**:
   在 `lib/api/` 中建立 API 客戶端，例如 `fred-client.ts`。

2. **取代 Mock Source**:
   修改 `lib/data/economic.ts`，將靜態回傳改為呼叫 API。
   ```typescript
   export const getLeadingIndicators = async () => {
     const data = await fetchFredData('PMI'); 
     return normalize(data); // 轉為 EconomicIndicator 格式
   };
   ```

3. **調整 Server Components**:
   將 `page.tsx` 中的資料獲取改為 `await` 非同步呼叫。

## 📦 安裝與執行

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)
