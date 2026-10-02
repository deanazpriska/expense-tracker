# 💸 Expense & Budget Visualizer

A mobile-friendly web app for tracking daily spending. See your total balance, browse your transaction history, and visualize spending by category — all stored locally in your browser.

---

## 📁 Project Structure

```
expense-tracker/
├── index.html          # App structure and markup
├── css/
│   └── styles.css      # All styling (mobile-first, dark theme)
├── js/
│   └── app.js          # All logic (transactions, chart, storage)
└── README.md
```

---

## 🚀 Getting Started

No installation or server required.

1. Download or clone this project
2. Open `index.html` in any modern browser
3. Start adding transactions

---

## ✨ Features

### Core
- **Balance Card** — displays your total amount spent, transaction count, and number of categories used
- **Add Transaction Form** — fields for item name, amount, category, and date with full validation
- **Transaction List** — scrollable list showing name, category, date, and amount; delete any entry with one click
- **Pie Chart** — visual breakdown of spending by category, powered by [Chart.js](https://www.chartjs.org/)

### Optional / Bonus
- **Custom Categories** — add your own categories beyond Food, Transport, and Fun
- **Monthly Summary** — pick any month to see a per-category breakdown with progress bars
- **Sort Transactions** — sort by newest, oldest, highest amount, lowest amount, or category
- **Filter Chips** — tap a category chip to filter the transaction list
- **Switchable Chart Types** — toggle between Pie, Doughnut, and Bar chart views

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Structure  | HTML5                   |
| Styling    | CSS3 (no frameworks)    |
| Logic      | Vanilla JavaScript (ES6+)|
| Chart      | Chart.js v4 (CDN)       |
| Storage    | Browser LocalStorage    |

> No build tools, no npm, no frameworks — just open and use.

---

## 📱 Browser Compatibility

Works in all modern browsers:

- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari (iOS & macOS)

---

## 💾 Data Storage

All data is saved to your browser's **LocalStorage** under two keys:

| Key                    | Contents                        |
|------------------------|---------------------------------|
| `expenseTrackerTx`     | Array of transaction objects    |
| `expenseTrackerCats`   | Array of custom category names  |

Data persists across page refreshes and browser restarts. Clearing browser site data will reset the app.

---

## 📸 App Sections

### 1. Balance Card
Shows total amount spent across all transactions, updated instantly whenever you add or delete an entry.

### 2. Add Transaction Form
- **Item Name** — what you spent on (e.g. "Coffee")
- **Amount** — must be greater than 0
- **Category** — choose from Food, Transport, Fun, or a custom category
- **Date** — defaults to today; pick any past or future date

### 3. Spending Chart
A visual pie/doughnut/bar chart that breaks down your spending by category. Use the dropdown in the top-right of the card to switch chart types.

### 4. Monthly Summary
Pick a month from the date picker to see a ranked list of categories with horizontal progress bars showing relative spending.

### 5. Transaction List
- Filter by category using the chips above the list
- Sort using the dropdown (newest, oldest, highest $, lowest $, category)
- Delete individual transactions with the ✕ button

---

## 🎨 Customization

To add new default categories, open `js/app.js` and add to the `CATEGORY_COLORS` object:

```js
const CATEGORY_COLORS = {
  Food:      '#ff6584',
  Transport: '#43e97b',
  Fun:       '#6c63ff',
  Health:    '#06d6a0',  // ← add here
};
```

Then add a matching `<option>` in `index.html` inside the `#category` select.

---

## 📄 License

MIT — free to use, modify, and distribute.
