import React from "react";

const AboutUsSection = () => {
  return (
    <section className="bg-stone-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left lg:order-1">
            <h2 className="text-base font-semibold tracking-wider text-amber-600 uppercase">
              Our Culinary Legacy
            </h2>
            <p className="mt-2 text-3xl font-serif font-extrabold text-gray-900 sm:text-4xl">
              Crafting Excellence Since 1995
            </p>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              For over two decades, Shiv Scientific Concern has been the trusted
              partner for bakers, from passionate home cooks to professional
              patisseries. Founded in 1995, our journey began with a simple
              mission: to source and provide the finest, highest-quality baking
              raw materials. We believe that every great creation starts with
              exceptional ingredients, and our legacy is built on a foundation
              of quality, trust, and a deep love for the art of baking.
            </p>
            <div className="mt-8">
              <a
                href="/about"
                className="inline-block bg-gray-800 text-white font-semibold py-3 px-8 rounded-md hover:bg-gray-900 transition-colors duration-300 shadow-lg transform hover:-translate-y-1"
              >
                Learn More About Us
              </a>
            </div>
          </div>

          <div className="relative h-80 w-full lg:h-96 rounded-lg shadow-xl overflow-hidden group lg:order-2">
            <img
              src="/wwik.webp"
              alt="Artisanal baking ingredients"
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
