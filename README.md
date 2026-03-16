<div align="center">
  <img width="1200" height="475" alt="Minifig Hub Banner" src="https://picsum.photos/seed/minifigures/1200/475?blur=2" />
  
  # Minifig Hub
  ### The Definitive LEGO Minifigure Collector Authority & Taxonomy
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
</div>

---

## 🌌 Overview

**Minifig Hub** is a world-class digital platform designed for serious LEGO minifigure collectors. It goes beyond simple collection tracking by implementing a professional **Collector Authority Framework**—a definitive taxonomy for classifying every minifigure ever released.

Whether you are building a massive army or hunting for the rarest vintage figures, Minifig Hub provides the data, insights, and organization tools you need.

## ✨ Key Features

### 🏛️ Collector Authority Framework
Explore our specialized classification system:
- **Army Builders:** Mass-scale infantry (Clones, Stormtroopers, Droids, Orcs, Soldiers).
- **Character Centerpieces:** Iconic anchors for your display (Vader, Batman, Harry Potter, Iron Man).
- **Elite Specialists:** Tactical units and specialized forces (Mandalorians, Death Troopers, Inquisitors, Ninjas).
- **Support Units:** Technical and operational personnel (Pilots, Officers, Mechanics, Droids).

### 📈 Market Intelligence
- **Real-time Valuation:** Track the current market value of your entire collection.
- **Market Movers:** Identify which figures are trending up or down in price.
- **Rarity Analysis:** Deep dives into the most elusive and valuable figures ever released.

### 🛠️ Collection Management
- **One-Tap Tracking:** Easily mark figures as "Owned" or add them to your wishlist.
- **Stats Dashboard:** Visualize your collection's growth, total value, and completion percentage.
- **Search & Filter:** Find any figure by theme, year, or item number instantly.

### 🧬 Evolution Timelines
- **Design History:** Trace the physical evolution of iconic characters (e.g., the evolution of Batman's cowl or Clone Trooper armor).
- **Mold Variations:** Detailed guides on mold changes and printing updates over 40+ years of LEGO history.

## 🚀 Technical Stack

- **Frontend:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS (Utility-first, modern UI)
- **Database & Auth:** Supabase (PostgreSQL)
- **Animations:** Framer Motion
- **Icons:** Lucide React & FontAwesome
- **Mobile:** Capacitor (iOS/Android ready)
- **SEO:** React Helmet Async for optimized search visibility

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd minifig-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Supabase and Gemini credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 📱 Mobile Deployment

This project is configured with **Capacitor**. To run on mobile devices:

```bash
# Build the web assets
npm run build

# Add platforms
npx cap add ios
npx cap add android

# Open in IDE
npx cap open ios
npx cap open android
```

---

<div align="center">
  <p><i>"Every minifigure has a story. Keep building your legacy."</i></p>
</div>
