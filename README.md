# Alankariya (Alankapriya) – Premium AI-Powered Shopping Assistant

Alankariya is a high-end, elegant, and intelligent shopping assistant designed to build buyer confidence and guide consumers to the perfect purchasing decisions. Combining elegant typography, fluid transitions, and a premium "Apple-style" AI welcome experience, Alankariya is optimized for modern web devices with native Firestore integration, real-time product comparisons, and AI-curated product universes.

---

## ✨ Features & Visual Highlights

*   **Premium Welcome Experience**: A smooth, cinematic welcome sequence with subtle ambient particles, fluid morphing shoppable items, staggered AI promise checklists, and a magical glassmorphic entry card.
*   **AI Product Finder**: A conversational, filter-driven AI recommendation wizard that matches user specifications with perfect budget, performance, and category alignments.
*   **Watchlist & Comparisons**: Side-by-side spec comparison table for chosen products.
*   **Seamless Integration**: Designed with full-stack capabilities, modern Tailwind CSS variables, and high-performance Framer Motion (via `motion/react`) animations.

---

## 🛠️ Development & Deployment Architecture

This project is configured to run on local environments (like **Termux**) and deploy directly to **Firebase Hosting**.

### Prerequisites

Make sure you have Node.js and the Firebase CLI installed on your Termux/local system:
```bash
npm install -g firebase-tools
```

### 1. Installation

Clone the repository and install dependencies:
```bash
git clone https://github.com/namanabharat07-dotcom/Alankariya.git
cd Alankariya
npm install
```

### 2. Development Mode

To start the local development server:
```bash
npm run dev
```

### 3. Build & Production Deployment

To compile the production-ready static assets and deploy directly to Firebase Hosting:
```bash
# Build the project
npm run build

# Deploy only the static hosting assets to Firebase
firebase deploy --only hosting
```

---

## 🔄 Version Control Workflow

This repository uses **GitHub** as the single source of truth. Changes made in Google AI Studio or other developer interfaces can be synchronized seamlessly with your local system.

### Pulling Updates to Local Termux

When files are updated remotely, run the following on your Termux device to fetch the latest additions:
```bash
git pull origin main
```
