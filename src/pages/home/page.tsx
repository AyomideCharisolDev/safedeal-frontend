import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [theme, setTheme] = useState('dark');
  const [isVisible, setIsVisible] = useState(false);
  const Navigate = useNavigate();
  
  useEffect(() => {
    setIsVisible(true);
    
    // Optional: Add scroll animation triggers
    const handleScroll = () => {
      const scrollElements = document.querySelectorAll('.scroll-animate');
      scrollElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Custom animated SVG components
  const SecurityShieldSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <path 
        className={`${theme === 'dark' ? 'stroke-blue-400' : 'stroke-blue-600'} fill-none animate-dash`}
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
      />
      <path 
        className={`${theme === 'dark' ? 'stroke-purple-400' : 'stroke-purple-600'} fill-none animate-dashReverse`} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        d="M9 12l2 2 4-4" 
      />
    </svg>
  );
  
  const BlockchainSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <path 
        className={`${theme === 'dark' ? 'stroke-purple-400' : 'stroke-purple-600'} fill-none animate-pulse`}
        strokeWidth="1.5" 
        d="M7 10V7a5 5 0 0 1 10 0v3" 
      />
      <rect 
        className={`${theme === 'dark' ? 'stroke-blue-400 fill-blue-900/20' : 'stroke-blue-600 fill-blue-100/50'} animate-fadeIn`}
        strokeWidth="1.5" 
        x="3" 
        y="10" 
        width="18" 
        height="12" 
        rx="2" 
      />
      <circle 
        className={`${theme === 'dark' ? 'fill-purple-500' : 'fill-purple-500'} animate-pulse`}
        cx="12" 
        cy="16" 
        r="2" 
      />
    </svg>
  );
  
  const PaymentSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full">
      <rect 
        className={`${theme === 'dark' ? 'stroke-purple-400 fill-none' : 'stroke-purple-600 fill-none'} animate-reveal`}
        strokeWidth="1.5" 
        x="2" 
        y="5" 
        width="20" 
        height="14" 
        rx="2" 
      />
      <line 
        className={`${theme === 'dark' ? 'stroke-blue-400' : 'stroke-blue-600'} animate-draw`}
        strokeWidth="1.5" 
        x1="2" 
        y1="10" 
        x2="22" 
        y2="10" 
      />
      <circle 
        className={`${theme === 'dark' ? 'fill-green-500' : 'fill-green-500'} animate-bounce-slow`}
        cx="18" 
        cy="15" 
        r="1.5" 
      />
      <circle 
        className={`${theme === 'dark' ? 'fill-blue-500' : 'fill-blue-500'} animate-bounce-slow animation-delay-200`}
        cx="14" 
        cy="15" 
        r="1.5" 
      />
    </svg>
  );
  
  const WaveBgSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute inset-0 h-full w-full">
      <path 
        className={`${theme === 'dark' ? 'fill-purple-900/5' : 'fill-purple-500/5'} animate-wave`}
        fillOpacity="1" 
        d="M0,128L48,128C96,128,192,128,288,149.3C384,171,480,213,576,208C672,203,768,149,864,128C960,107,1056,117,1152,133.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
      <path 
        className={`${theme === 'dark' ? 'fill-blue-900/5' : 'fill-blue-500/5'} animate-wave animation-delay-500`}
        fillOpacity="1" 
        d="M0,256L48,245.3C96,235,192,213,288,197.3C384,181,480,171,576,186.7C672,203,768,245,864,234.7C960,224,1056,160,1152,138.7C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      />
    </svg>
  );
  
  const ParticlesSVG = () => {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} 
            className={`absolute rounded-full 
            ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-400'} 
            opacity-20 animate-float`}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          ></div>
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i + 20} 
            className={`absolute rounded-full 
            ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'} 
            opacity-20 animate-float`}
            style={{
              width: `${Math.random() * 8 + 3}px`,
              height: `${Math.random() * 8 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 15}s`
            }}
          ></div>
        ))}
      </div>
    );
  };
  
  const BackgroundGradient = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full ${theme === 'dark' ? 'bg-purple-700' : 'bg-purple-400'} blur-3xl opacity-10 animate-pulse`}></div>
      <div className={`absolute top-1/3 -left-40 w-96 h-96 rounded-full ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-400'} blur-3xl opacity-10 animate-pulse animation-delay-1000`}></div>
      <div className={`absolute bottom-20 right-1/4 w-96 h-96 rounded-full ${theme === 'dark' ? 'bg-pink-700' : 'bg-pink-400'} blur-3xl opacity-10 animate-pulse animation-delay-2000`}></div>
    </div>
  );
  
  // Custom animated logo component
  const AnimatedLogo = () => (
    <div className={`w-12 h-12 rounded-lg relative overflow-hidden ${theme === 'dark' ? 'bg-gradient-to-br from-purple-600 to-blue-500' : 'bg-gradient-to-br from-purple-500 to-blue-400'} flex items-center justify-center animate-shimmer`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide"></div>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
          className="animate-draw"
        />
      </svg>
    </div>
  );
  
  // Custom button component with hover animation
  const AnimatedButton: React.FC<{ primary: boolean; children: React.ReactNode; className?: string }> = ({ primary, children, className = "" }) => (
    <button
      className={`relative overflow-hidden group px-8 py-3 rounded-lg font-medium transition-colors ${
        primary 
          ? `${theme === 'dark' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600' 
              : 'bg-gradient-to-r from-purple-500 to-blue-400 hover:from-purple-600 hover:to-blue-500'} text-white shadow-lg` 
          : `${theme === 'dark' 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-900 border border-gray-300'}`
      } ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-transform duration-300"></div>
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Animated background elements */}
      {/* <BackgroundGradient /> */}
      <ParticlesSVG />
      
      {/* Navigation */}
      <nav className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-md border-b transition-all duration-300`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className={`flex items-center transform transition-transform duration-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}
          >
            <AnimatedLogo />
            <span className="text-xl font-bold ml-3">SafeDeal</span>
          </div>
          
          <div className={`flex items-center space-x-4 transform transition-all duration-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition-all duration-300`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            
            <div className="hidden md:flex items-center space-x-4">
              <a href="#features" className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>Features</a>
              <a href="#benefits" className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>Benefits</a>
              <a href="#who-can-use" className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>Who Can Use</a>
            </div>
            
            <div className="md:flex hidden items-center space-x-3">
                <Link to='/login'> <button className={`px-5 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                Log In
              </button></Link>
              
               <Link to="/signup"> <AnimatedButton primary>Sign Up</AnimatedButton></Link>
            </div>
            
            <button className="md:hidden" aria-label="Menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 overflow-hidden">
        <WaveBgSVG />
        
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="max-w-2xl">
            <div 
              className={`transform transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Anti-scam Protocol For {' '}
                <span className={`${theme === 'dark' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500' : 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600'} animate-gradient-text`}>
                  Social Commerce dealers
                </span>
              </h1>
              
              <p 
                className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                SafeDeal protects both buyers and sellers with Solana-powered escrow services. Fast, secure, and transparent transactions guaranteed.
              </p>
            </div>
            
            <div 
              className={`flex flex-wrap gap-4 transform transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            >
              <Link to="/signup">
              <AnimatedButton primary className="text-lg">
                Get Started
              </AnimatedButton>
              </Link>
              
              <AnimatedButton className="text-lg">
                Watch a demo
              </AnimatedButton>
            </div>
            
            <div 
              className={`mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 transform transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}
            >
              {[
                { icon: "💰", text: "Pay with SOL or USDC" },
                { icon: "⚡", text: "Instant settlements" },
                { icon: "🛡️", text: "100% Secure" }
              ].map((item, index) => (
                <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/80'} backdrop-blur-sm transition-all hover:scale-105`}>
                  <div className="text-xl">{item.icon}</div>
                  <span className={theme === 'dark' ? 'text-gray-300 text-sm font-bold font-sans' : 'text-gray-600'}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div 
            // className={`lg:justify-self-end transform transition-all duration-700 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}
          >
            <div className={`relative ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-2 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-500`}>
              <div className={`absolute inset-0 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600/20 to-blue-500/20' : 'bg-gradient-to-r from-purple-500/20 to-blue-400/20'} animate-gradient-move`}></div>
              
              {/* Laptop mockup with animated UI elements */}
              <div className="relative aspect-[16/10] bg-gray-900 rounded-xl overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 gap-2 p-3">
                  {/* Animated interface elements */}
                  <div className={`col-span-3 row-span-1 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                  <div className={`col-span-2 row-span-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'} animate-pulse animation-delay-300`}></div>
                  <div className={`col-span-2 row-span-1 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'} animate-pulse animation-delay-600`}></div>
                  <div className={`col-span-3 row-span-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} p-2 flex flex-col`}>
                    <div className={`h-3 w-3/4 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} mb-2 animate-pulse`}></div>
                    <div className={`h-3 w-2/3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} mb-2 animate-pulse animation-delay-300`}></div>
                    <div className={`h-3 w-5/6 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} animate-pulse animation-delay-600`}></div>
                    <div className="flex-grow"></div>
                    <div className={`h-6 w-1/3 rounded-lg ${theme === 'dark' ? 'bg-purple-700/50' : 'bg-purple-500/50'} animate-pulse animation-delay-900`}></div>
                  </div>
                  <div className={`col-span-1 row-span-1 rounded-lg ${theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100'} animate-pulse animation-delay-1200`}></div>
                  <div className={`col-span-1 row-span-1 rounded-lg ${theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100'} animate-pulse animation-delay-1500`}></div>
                </div>
                
                <div className="absolute bottom-3 right-3 animate-bounce">
                  <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-3 -right-3 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20,50 Q50,10 80,50 Q50,90 20,50" className={`${theme === 'dark' ? 'stroke-purple-500' : 'stroke-purple-600'} fill-none`} strokeWidth="2" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawPath 2s forwards" }}/>
                </svg>
              </div>
              <div className="absolute -bottom-3 -left-3 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30,20 L70,20 L70,80 L30,80 Z" className={`${theme === 'dark' ? 'stroke-blue-500' : 'stroke-blue-600'} fill-none`} strokeWidth="2" strokeDasharray="300" strokeDashoffset="300" style={{ animation: "drawPath 2s forwards" }}/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`relative py-20 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/60'} overflow-hidden scroll-animate`}>
        <div className="absolute inset-0">
          <WaveBgSVG />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div 
            className="text-center mb-16 scroll-animate"
          >
            <h2 className="text-3xl font-bold mb-4">How SafeDeal Works</h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300 text-sm font-bold font-sans' : 'text-gray-600'}`}>
              Our platform ensures safe transactions with a simple process that protects both parties.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting lines between feature boxes */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 hidden md:block">
              <div className={`h-full ${theme === 'dark' ? 'bg-gradient-to-r from-purple-600/30 via-blue-500/30 to-purple-600/30' : 'bg-gradient-to-r from-purple-500/30 via-blue-400/30 to-purple-500/30'}`}></div>
            </div>
            
            {[
              {
                icon: <div className="w-16 h-16"><SecurityShieldSVG /></div>,
                title: "Create a Deal",
                description: "Specify price, deadline, and deliverables. Upload any necessary agreement documents."
              },
              {
                icon: <div className="w-16 h-16"><BlockchainSVG /></div>,
                title: "Secure Payment",
                description: "Funds are held in escrow using Solana blockchain until work is completed to satisfaction."
              },
              {
                icon: <div className="w-16 h-16"><PaymentSVG /></div>,
                title: "Release Funds",
                description: "When work is completed, funds are automatically released to the seller after approval."
              }
            ].map((feature, index) => (
              <div key={index} className="scroll-animate">
                <div 
                  className={`group p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-900/80' : 'bg-white'} shadow-lg backdrop-blur-sm relative overflow-hidden hover:translate-y-[-5px] transition-all duration-300`}
                >
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20' 
                      : 'bg-gradient-to-br from-purple-100 via-transparent to-blue-100'
                  }`}></div>
                  
                  {/* Step number */}
                  <div className={`absolute -top-2 -right-2 w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center text-lg font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} border-2 ${theme === 'dark' ? 'border-purple-500/30' : 'border-purple-500/30'}`}>
                    {index + 1}
                  </div>
                  
                  {/* Content */}
                  <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-purple-50'}`}>
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30' : 'bg-gradient-to-r from-purple-100 to-blue-100'}`}></div>
                    <div className="relative z-10">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} scroll-animate`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="text-3xl font-bold mb-4">Why Choose SafeDeal?</h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Our platform offers numerous advantages over traditional escrow services and direct payments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Blockchain Security",
                description: "Every transaction is secured by Solana's blockchain technology with military-grade encryption.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )
              },
              {
                title: "Low Transaction Fees",
                description: "Save money with our minimal fee structure - just 1% compared to traditional escrow services charging 5-10%.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Lightning Fast Settlements",
                description: "Instant payment releases with Solana's sub-second transaction finality.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Dispute Resolution",
                description: "Our expert mediators ensure fair outcomes if something goes wrong.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                )
              },
              {
                title: "No Chargebacks",
                description: "Once confirmed, transactions cannot be reversed, protecting sellers from fraud.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              // {
              //   title: "Smart Contracts",
              //   description: "Automated escrow release based on predefined conditions and timeframes.",
              //   icon: (
              //     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              //     </svg>
              //   )
              // }
            ].map((benefit, index) => (
              <div 
                key={index}
                className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} overflow-hidden group hover:-translate-y-1 transition-all duration-300 scroll-animate`}
              >
                <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700 text-purple-400' : 'bg-purple-100 text-purple-600'} group-hover:scale-110 transition-transform duration-300`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section id="who-can-use" className={`py-20 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/60'} relative overflow-hidden`}>
        <div className="absolute inset-0">
          <WaveBgSVG />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="text-3xl font-bold mb-4">Who Can Use SafeDeal</h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Our platform is designed for various use cases across different industries
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Freelancers",
                description: "Secure payment for your services before starting work.",
                icon: "👩‍💻",
                color: theme === 'dark' ? 'from-purple-800/20 to-purple-600/20' : 'from-purple-200 to-purple-100'
              },
              {
                title: "Online Sellers",
                description: "Gain customer trust with guaranteed product delivery.",
                icon: "🛍️",
                color: theme === 'dark' ? 'from-blue-800/20 to-blue-600/20' : 'from-blue-200 to-blue-100'
              },
              {
                title: "Digital Creators",
                description: "Protect your digital products until payment is confirmed.",
                icon: "🎨",
                color: theme === 'dark' ? 'from-green-800/20 to-green-600/20' : 'from-green-200 to-green-100'
              },
              {
                title: "Small Businesses",
                description: "Secure B2B transactions with other companies.",
                icon: "🏪",
                color: theme === 'dark' ? 'from-yellow-800/20 to-yellow-600/20' : 'from-yellow-200 to-yellow-100'
              },
              {
                title: "Real Estate",
                description: "Handle property deposits and transaction closings.",
                icon: "🏠",
                color: theme === 'dark' ? 'from-red-800/20 to-red-600/20' : 'from-red-200 to-red-100'
              },
              {
                title: "Remote Teams",
                description: "Pay contractors securely across borders.",
                icon: "🌎",
                color: theme === 'dark' ? 'from-indigo-800/20 to-indigo-600/20' : 'from-indigo-200 to-indigo-100'
              }
            ].map((user, index) => (
              <div key={index} className="scroll-animate">
                <div 
                  className={`h-full p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-900/80 hover:bg-gray-900' : 'bg-white hover:bg-white'} shadow-lg backdrop-blur-sm transition-all duration-300 group hover:scale-[1.02]`}
                >
                  <div className={`w-16 h-16 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${user.color} text-3xl group-hover:scale-110 transition-transform duration-300`}>
                    {user.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{user.title}</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Hear from people who have used SafeDeal to protect their transactions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "As a freelancer, I've been burnt by clients disappearing before. SafeDeal gives me peace of mind knowing the money is there before I start work.",
                name: "Sarah T.",
                role: "Web Developer",
                avatar: "👩‍💻"
              },
              {
                quote: "I sell rare collectibles online, and my customers appreciate the extra security. It's helped me close deals I wouldn't have otherwise.",
                name: "Michael R.",
                role: "Vintage Seller",
                avatar: "👨‍💼"
              },
              {
                quote: "The low fees and fast settlement times make this so much better than traditional escrow. I'll never go back.",
                name: "Jessica K.",
                role: "Digital Artist",
                avatar: "👩‍🎨"
              }
            ].map((testimonial, index) => (
              <div key={index} className="scroll-animate">
                <div 
                  className={`h-full p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} relative group`}
                >
                  {/* Quote marks */}
                  <div className={`absolute top-4 left-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity ${theme === 'dark' ? 'text-purple-500' : 'text-purple-400'}`}>
                    "
                  </div>
                  
                  <div className="relative">
                    <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} italic`}>
                      "{testimonial.quote}"
                    </p>
                    
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center text-2xl`}>
                        {testimonial.avatar}
                      </div>
                      <div className="ml-4">
                        <div className="font-bold">{testimonial.name}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} scroll-animate`}>
        <div className="container mx-auto px-6 max-w-4xl">
          <div className={`p-8 md:p-12 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30' : 'bg-gradient-to-br from-purple-100 to-blue-100'} relative overflow-hidden`}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <WaveBgSVG />
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Secure Your Transactions?</h2>
              <p className={`text-lg mb-8 max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Join thousands of users who trust SafeDeal for their business and personal transactions. Start today with zero setup fees.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to='/signup'>
                <AnimatedButton primary className="text-lg px-10 py-4">
                  Create Free Account
                </AnimatedButton>
                </Link>
                
                <button 
                  className={`flex items-center space-x-2 text-lg font-medium ${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-500'} transition-colors`}
                >
                  <span>Watch Demo</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <AnimatedLogo />
                <span className="text-xl font-bold ml-3">SafeDeal</span>
              </div>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                The most secure escrow service built on Solana blockchain technology.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'instagram', 'github'].map(platform => (
                  <a 
                    key={platform}
                    href={`#${platform}`}
                    className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                    aria-label={platform}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Security", "Pricing", "How it Works", "FAQ"]
              },
              {
                title: "Company",
                links: ["About", "Careers", "Blog", "Press", "Contact"]
              },
              {
                title: "Legal",
                links: ["Terms", "Privacy", "Cookies", "Licenses", "Dispute Policy"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="text-lg font-bold mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a 
                        href={`#${link.toLowerCase()}`}
                        className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className={`pt-8 mt-8 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} flex flex-col md:flex-row justify-between items-center`}>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              &copy; {new Date().getFullYear()} SafeDeal. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a 
                href="#terms"
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} text-sm transition-colors`}
              >
                Terms of Service
              </a>
              <a 
                href="#privacy"
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} text-sm transition-colors`}
              >
                Privacy Policy
              </a>
              <a 
                href="#cookies"
                className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} text-sm transition-colors`}
              >
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom styling for animations */}
      <style jsx global>{`
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(10px) translateX(10px);
          }
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes dashReverse {
          to {
            stroke-dashoffset: 1000;
          }
        }
        
        @keyframes draw {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes reveal {
          0% {
            clip-path: inset(0 100% 0 0);
          }
          100% {
            clip-path: inset(0 0 0 0);
          }
        }
        
        @keyframes shimmer {
          0% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(147, 51, 234, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(147, 51, 234, 0);
          }
        }
        
        @keyframes slide {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes gradient-text {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes gradient-move {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-wave {
          animation: wave 15s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-dash {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 3s linear forwards;
        }
        
        .animate-dashReverse {
          stroke-dasharray: 1000;
          stroke-dashoffset: 0;
          animation: dashReverse 3s linear forwards;
        }
        
        .animate-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s linear forwards;
        }
        
        .animate-reveal {
          animation: reveal 1.5s ease forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-slide {
          animation: slide 1.5s infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
        }
        
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradient-move 10s ease infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
        
        .animation-delay-900 {
          animation-delay: 0.9s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1200 {
          animation-delay: 1.2s;
        }
        
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .scroll-animate {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .scroll-animate.active {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}