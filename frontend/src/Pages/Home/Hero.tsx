// components/Hero.tsx

"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'; 

interface HeroProps {}

const Hero: React.FC<HeroProps> = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400&display=swap');
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
        .font-lato {
          font-family: 'Lato', sans-serif;
        }
      `}</style>

      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-0 w-full h-full object-cover"
        >
          {/* Make sure this video is in your `public/videos/` folder */}
          <source src="/videos/4686841-uhd_4096_2160_25fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Overlay */}
        <div className="absolute z-10 w-full h-full bg-black opacity-50"></div>

        <header className="absolute top-0 right-0 z-30 p-4 md:p-6">
        <Link href="/login">
            <motion.div
              className="font-lato bg-transparent text-white font-semibold py-2 px-6 border border-white/80 rounded-full text-base shadow-lg cursor-pointer"
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.div>
          </Link>
        </header>

        <motion.div
          className="relative z-20 text-center text-white px-6 sm:px-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
            variants={itemVariants}
          >
            Shiv Scientific Concern
          </motion.h1>

          <motion.p
            className="font-lato text-lg md:text-xl lg:text-2xl mt-4 max-w-3xl mx-auto font-light"
            variants={itemVariants}
          >
            Crafting Culinary Excellence, One Ingredient at a Time. Your trusted partner for the finest bakery raw materials.
          </motion.p>

          <motion.div
            className="mt-10"
            variants={itemVariants}
          >
            {/* This button can link to your products section */}
            <motion.a
              href="#products"
              className="font-lato inline-block bg-white text-gray-900 font-semibold py-3 px-8 rounded-full text-lg shadow-lg"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Our Collection
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Hero;