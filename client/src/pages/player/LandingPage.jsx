import React, { useState, useEffect } from 'react';
import { Gamepad2, MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react';

const WelcomePage = ({ onLogin, onRegister, onGuestPlay }) => {
  // Parallax effect for background
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-amber-200/20 to-transparent rounded-full transform rotate-12"
          style={{ transform: `translateY(${scrollY * 0.1}px) rotate(12deg)` }}
        />
        <div 
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full transform -rotate-12"
          style={{ transform: `translateY(${-scrollY * 0.1}px) rotate(-12deg)` }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
            <Gamepad2 className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
            Escape Game
          </span>
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4">
    
          <button 
            onClick={() => onLogin?.()}
            className="px-6 py-2 text-amber-700 border border-amber-700 rounded-lg hover:bg-amber-50 font-medium transition-all duration-300"
          >
            Login
          </button>
          <button 
            onClick={() => onRegister?.()}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 font-medium transition-all duration-300"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="max-w-6xl mx-auto px-8 py-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-8 animate-bounce">
            <Star className="w-4 h-4 mr-2" />
            Tunisia's Most Immersive AR Experience
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 leading-tight mb-6">
            Unlock the
            <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Mysteries
            </span>
            of Skifa Kahla
          </h1>

          {/* Description */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
            Step into the ancient Ottoman fortress and embark on an epic treasure hunt. 
            Solve cryptic puzzles, decode ancient ciphers, and uncover hidden secrets 
            using cutting-edge AR technology.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button 
              onClick={() => onRegister?.()}
              className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-amber-500/25 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Your Adventure</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button 
              onClick={() => onLogin?.()}
              className="px-8 py-4 border-2 border-amber-600 text-amber-700 font-bold text-lg rounded-2xl hover:bg-amber-50 transform hover:scale-105 transition-all duration-300"
            >
              Continue Quest
            </button>
            
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
            <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="text-amber-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Historic Location</h3>
              <p className="text-gray-600">Explore the authentic Ottoman fortress with immersive AR overlays</p>
            </div>
            
            <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="text-amber-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">90 Minutes</h3>
              <p className="text-gray-600">Perfect duration for an immersive adventure experience</p>
            </div>
            
            <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-amber-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600">Powered intelligent guide to help you on your quest</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-3 h-3 bg-amber-400 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute top-40 right-32 w-2 h-2 bg-orange-400 rounded-full animate-bounce opacity-40"></div>
      <div className="absolute bottom-32 left-40 w-4 h-4 bg-amber-300 rounded-full animate-ping opacity-30"></div>
      <div className="absolute top-1/2 right-20 w-1 h-1 bg-orange-500 rounded-full animate-pulse opacity-50"></div>
      <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-amber-500 rounded-full animate-bounce opacity-60"></div>
    </div>
  );
};

export default WelcomePage;