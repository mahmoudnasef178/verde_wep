import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductsSection from './components/ProductsSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main id="main">
        <h1 className="sr-only">VERDE | براند عطور فاخرة في مصر - Luxury Fragrances & Perfumes</h1>
        <HeroSection />
        <ProductsSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
