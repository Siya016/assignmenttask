# Solar Ops Mini-Cockpit

A  Next.js dashboard for solar operations monitoring, anomaly detection, and AI-powered operational recommendations.

## Features

- 📊 **Interactive Charts**: Time-series visualization with brush selection
- 🔍 **Anomaly Detection**: Automated detection of power factor, voltage, and idle period issues
- 🤖 **AI Analysis**: Google Gemini-powered operational recommendations
- 📁 **XLSX Processing**: In-browser parsing of solar data files
- 📋 **Event Management**: Clickable event chips with time-based navigation
- 📈 **Performance Optimized**: Lazy loading, memoization, and bundle splitting

📦 Live Demo: https://solarops.vercel.app  
📄 PRD: docs/PRD.md  
🧠 Prompt Appendix: docs/PromptAppendix.md  
🧩 Orchestration Sketch: docs/orchestration-sketch.png  
📚 ADRs: docs/ADR-01.md, docs/ADR-02.md


## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Gemini API key (for AI features)

### Installation & Setup

```bash
# Clone and install
git clone <repository-url>
cd solar-mini-cockpit
pnpm install

# Create environment file
cp .env.example .env.local


# Start development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)



## Usage

### 1. Upload Data
- Drag and drop XLSX files containing solar data
- Supports flexible column mapping (timestamp, site, powerFactor, voltage, etc.)
- Files are processed in-browser for security

### 2. Review Events
- Anomalies are automatically detected using built-in rules
- Click event chips to focus charts on problem timeframes


### 3. Get Recommendations
- AI analysis provides 3 actionable bullet points


### 4. Monitor Operations
- Visit `/logs` to review system operations



# Testing
pnpm test             #  unit tests
pnpm test:e2e         #  E2E tests

# Validation
pnpm self-check       # Validate with test data


## Self-Check Validation

The project includes a self-check script that validates functionality:


# Run validation
pnpm self-check
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Visx (time-series) + Recharts (histograms)
- **State**: Zustand
- **AI**: Google Gemini API
- **Testing**: Vitest + Playwright
- **Data**: SheetJS (XLSX parsing)

### Performance Budgets
- **LCP**: < 2.5s (Largest Contentful Paint)
- **CLS**: < 0.1 (Cumulative Layout Shift)  
- **TTI**: < 3.5s (Time to Interactive)

📏 Performance Budgets:
✅ LCP < 2.5s  → PASS
✅ CLS < 0.1   → PASS
✅ TTI < 3.5s  → FAIL




## Testing

### Unit Tests (Vitest)
```bash
pnpm test
```
- XLSX parsing and data joining
- Rule engine anomaly detection  
- Zustand store operations

### E2E Tests (Playwright)
```bash
pnpm test:e2e
```
- Dashboard navigation and interactions
- Logs page filtering and search
- Model toggle and analysis workflow



### Environment Variables
```bash
# Required for AI features
GEMINI_API_KEY=your-gemini-api-key

# Optional
NODE_ENV=production
```
