import BestSellingItems from "@/Pages/Home/BestSelling";
import Hero from "@/Pages/Home/Hero";
import ShopByCategory from "@/Pages/Home/ShopByCategory";
import AboutUsSection from "@/Pages/Home/SmallAboutUs";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
    <Navbar/>
    <Hero/>
    <AboutUsSection/>
    <ShopByCategory/>
    <BestSellingItems/>
    </>
  )
}