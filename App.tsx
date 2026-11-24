import { MotionConfig } from 'framer-motion';
import { ShopProvider } from './context/ShopContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { QuickEssentials } from './components/QuickEssentials';
import { ShopSection } from './components/ShopSection';
import { RecentlyViewed } from './components/RecentlyViewed';
import { Offers } from './components/Offers';
import { Freshness } from './components/Freshness';
import { WhyUs } from './components/WhyUs';
import { Seasonal } from './components/Seasonal';
import { Budget } from './components/Budget';
import { ShoppingList } from './components/ShoppingList';
import { About } from './components/About';
import { Location } from './components/Location';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { QuickView } from './components/QuickView';
import { FloatingActions, Toasts } from './components/Extras';

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ShopProvider>
        <a href="#shop" className="sr-only z-[100] rounded bg-white px-4 py-2 font-semibold text-forest focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to products</a>
        <AnnouncementBar />
        <Navbar />
        <main>
          <Hero />
          <Categories />
          <ShopSection />
          <Freshness />
          <QuickEssentials />
          <RecentlyViewed />
          <Offers />
          <WhyUs />
          <Seasonal />
          <Budget />
          <ShoppingList />
          <About />
          <Location />
          <Contact />
        </main>
        <Footer />
        <CartDrawer />
        <WishlistDrawer />
        <SearchOverlay />
        <QuickView />
        <Toasts />
        <FloatingActions />
      </ShopProvider>
    </MotionConfig>
  );
}
