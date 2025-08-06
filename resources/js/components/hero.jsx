// resources/js/components/Hero.jsx
import React, { useState, useEffect } from 'react';

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const foodImages = [
        {
            url: "/images/adobo.jpg",
            title: "Adobong Manok",
            description: "A savory Filipino classic with soy sauce, vinegar, and garlic."
        },
        {
            url: "/images/batchoy.jpg",
            title: "Batchoy",
            description: "A hearty noodle soup topped with pork, liver, and crushed chicharon."
        },
        {
            url: "/images/dinuguan.jpg",
            title: "Dinuguan",
            description: "A rich and flavorful pork blood stew served with puto or rice."
        },
        {
            url: "/images/menudo.jpg",
            title: "Menudo",
            description: "Tender pork stewed in tomato sauce with potatoes, carrots, and raisins."
        },
        {
            url: "/images/sinigang-na-baboy.jpg",
            title: "Sinigang na Baboy",
            description: "A tangy pork soup with vegetables in tamarind broth."
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % foodImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [foodImages.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % foodImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + foodImages.length) % foodImages.length);
    };

    return (
        <section className="pt-16 bg-gradient-to-br from-green-50 to-white min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Home-Cooked 
                                <span className="text-green-600 block">Meals Made with Love</span>
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed">
                                Whether it's your everyday lunch or a simple handaan, we serve hearty Filipino dishes 
                                made from fresh ingredients, warm smiles, and a taste that feels just like home.
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                                Reserve a Seat
                            </button>
                            <button className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all">
                                View Menu
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src={foodImages[currentSlide].url}
                                alt={foodImages[currentSlide].title}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <h3 className="text-2xl font-bold mb-2">{foodImages[currentSlide].title}</h3>
                                <p className="text-white/90">{foodImages[currentSlide].description}</p>
                            </div>
                        </div>

                        {/* Slideshow Controls */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-green-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-green-600 p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Slide Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {foodImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
