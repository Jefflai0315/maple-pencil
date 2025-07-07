"use client";

import React, { useState, useEffect } from 'react'

import { 
  Instagram, 
  Mail, 
  MapPin, 
  Palette, 
  Star, 
  Users, 
  Heart,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  Pencil,
  Gamepad2
} from 'lucide-react'
import { ContactForm } from '../components/ContactForm'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [isNavVisible, setIsNavVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Sample portfolio data
  const portfolioItems = [
    {
      id: 1,
      title: "Father's Day Celebration",
      category: "family",
      image: "/gallery/quick/Com_8.jpg",
      description: "A heartfelt sketch of tender moment between a father and his newborn"
    },
    {
      id: 2,
      title: "Coffee Shop Regular",
      category: "wood",
      image: "/gallery/wood/3.jpg",
      description: "A daily customer who became a friend through art"
    },
    {
      id: 3,
      title: "Street Musician",
      category: "quick",
      image: "/gallery/quick/Com_5.jpg",
      description: "Capturing the soul of Singapore's street performers"
    },
    {
      id: 4,
      title: "Wedding Day Joy",
      category: "events",
      image: "/gallery/big/1.jpg",
      description: "Live sketching at a beautiful Singapore wedding"
    },
    {
      id: 5,
      title: "National's spirit",
      category: "detailed",
      image: "/gallery/big/2.jpg",
      description: "A detailed portrait of Singapore best - celebrating family"
    },
    {
      id: 6,
      title: "Hawker Center Stories",
      category: "wood",
      image: "/gallery/wood/1.jpg",
      description: "Wood sketch series featuring local food heroes"
    }
  ]

  const services = [
    {
      title: "Quick Sketches",
      price: "$20 SGD",
      duration: "5-15 minutes",
      description: "Fast and expressive sketches perfect for capturing moments on the go",
      features: ["Black and white pencil", "Digital copy included", "Perfect for events", "Great as gifts"]
    },
    {
      title: "Wood Sketches", 
      price: "$40 SGD",
      duration: "20-30 minutes",
      description: "Unique sketches on wood surfaces, creating rustic and natural artwork",
      features: ["Natural wood canvas", "Rustic aesthetic", "Perfect for home decor", "Custom sizes available"]
    },
    {
      title: "Detailed Portraits",
      price: "$70 SGD", 
      duration: "30-60 minutes",
      description: "Intricate and detailed portraits with careful attention to every feature",
      features: ["High-quality paper", "Detailed shading", "Perfect for special occasions", "Framing options available"]
    }
  ]

  const brands = [
    {
      name: "Wells Singapore",
      logo: "/brands/Wells-Singapore-Logo-PNG.webp",
      category: "Banking"
    },
    {
      name: "SUTD",
      logo: "/brands/SUTD-Logo.png",
      category: "Education"
    },
    {
      name: "Temasek Polytechnic",
      logo: "/brands/TPlogo.png",
      category: "Education"
    },
    {
      name: "Singapore Polytechnic",
      logo: "/brands/Singapore_Polytechnic_logo.png",
      category: "Education"
    },
    {
      name: "McDonald's",
      logo: "/brands/McDonaldspng.png",
      category: "Food & Beverage"
    },
    {
      name: "Moleskine",
      logo: "/brands/Moleskine.png",
      category: "Lifestyle"
    },
    {
      name: "Sharp",
      logo: "/brands/Sharp.png",
      category: "Technology"
    },
    {
      name: "ActiveSG",
      logo: "/brands/ActiveSG.png",
      category: "Sports"
    },
    {
      name: "UOB",
      logo: "/brands/UOB_POY.jpg",
      category: "Banking"
    },
    {
      name: "DBS PayLah!",
      logo: "/brands/DBSPayLah.png",
      category: "Fintech"
    },
    {
      name: "IKEA",
      logo: "/brands/IKEA.png",
      category: "Retail"
    },
    {
      name: "Scoot",
      logo: "/brands/Scoot.png",
      category: "Travel"
    }
  ]

  const features = [
    {
      name: "Kiss92",
      logo: "/brands/features/Kiss92_2.jpg",
      category: "Radio",
      description: "Featured on Singapore's #1 English radio station"
    },
    {
      name: "88.3JIA",
      logo: "/brands/features/88.3JIA.png",
      category: "Radio",
      description: "Interviewed on Singapore's Chinese radio station"
    },
    {
      name: "Capital 95.8FM",
      logo: "/brands/features/Capital_95.8FM.png",
      category: "Radio",
      description: "Featured on Singapore's Chinese radio network"
    },
    {
      name: "CNA Lifestyle",
      logo: "/brands/features/CNA_lifestyle.png",
      category: "Digital Media",
      description: "Featured on Channel NewsAsia's lifestyle section"
    },
    {
      name: "Lianhe Zaobao",
      logo: "/brands/features/Lian-He-Zao-Bao-Logo.webp",
      category: "Print Media",
      description: "Featured in Singapore's leading Chinese newspaper"
    },
    {
      name: "987FM",
      logo: "/brands/features/987FM.png",
      category: "Radio",
      description: "Interviewed on Singapore's English radio station"
    },
    {
      name: "The Straits Times",
      logo: "/brands/features/the-straits-times-logo.avif",
      category: "Print Media",
      description: "Featured in Singapore's leading English newspaper"
    }
  ]

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
      setIsMenuOpen(false)
    }
  }

  // Handle scroll for active section and nav visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const sections = ['home', 'about', 'services', 'portfolio', 'contact']
      const scrollPosition = currentScrollY + 100

      // Handle navigation visibility
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and not at the top
        setIsNavVisible(false)
      } else {
        // Scrolling up or at the top
        setIsNavVisible(true)
      }
      setLastScrollY(currentScrollY)

      // Handle active section
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const offsetTop = element.offsetTop
          const offsetHeight = element.offsetHeight
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <div className="min-h-screen organic-paper">
      {/* Navigation */}
      <nav className={`organic-nav px-4 py-4 transition-transform duration-300 ${
        isNavVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-6xl mx-auto px-2 flex items-center justify-between">
          <div className="font-handwritten text-3xl font-bold text-charcoal">
            Playing with Pencil
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['home', 'about', 'services', 'portfolio', 'contact'].map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`font-sketch text-lg capitalize transition-colors ${
                  activeSection === section 
                    ? 'text-charcoal font-bold sketch-heading' 
                    : 'text-charcoal-medium hover:text-charcoal'
                }`}
              >
                {section}
              </button>
            ))}
            <a 
              href="/world"
              className="font-sketch text-lg text-charcoal-medium hover:text-charcoal transition-colors flex items-center gap-2"
            >
              <Gamepad2 size={18} />
              World
            </a>
            <button 
              className="sketch-btn"
              onClick={() => scrollToSection('contact')}
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-charcoal"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute  top-full left-0 right-0 bg-paper-white border-t-2 border-sketch-gray">
            <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg border-b-2 border-charcoal-light">
              {['home', 'about', 'services', 'portfolio', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="font-sketch text-lg capitalize text-left text-charcoal-medium hover:text-charcoal"
                >
                  {section}
                </button>
              ))}
              <a 
                href="/world"
                className="font-sketch text-lg text-left text-charcoal-medium hover:text-charcoal flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gamepad2 size={18} />
                World
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center px-4 mt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 float-sketch mt-10">
            <h1 className="font-display text-6xl md:text-8xl font-bold text-charcoal mb-4 transform -rotate-1">
              Jeff Lai
            </h1>
            <p className="font-handwritten text-3xl md:text-4xl text-charcoal-medium mb-2 transform rotate-1">
              Playing with Pencil
            </p>
            <div className="wavy-divider my-6"></div>
            <p className="font-body text-lg md:text-xl text-charcoal-light max-w-2xl mx-auto">
              Street Portrait Artist | Story Seeker | Engineer from Singapore
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button 
              className="sketch-btn text-xl px-8 py-4 flex items-center gap-2"
              onClick={() => scrollToSection('portfolio')}
            >
              <Pencil size={20} />
              View My Work
            </button>
            <button 
              className="sketch-btn text-xl px-8 py-4 flex items-center gap-2 cursor-pointer"
              onClick={() => scrollToSection('contact')}
            >
              <Heart size={20} />
              Book a Session
            </button>
            <a 
              href="/world"
              className="sketch-btn text-xl px-8 py-4 flex items-center gap-2"
            >
              <Gamepad2 size={20} />
              Enter the World
            </a>
          </div>

          {/* Stats in organic containers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-8 max-w-2xl mx-auto">
            <div className="sketch-container text-center transform rotate-1 p-1">
              <div className="font-display text-4xl font-bold text-charcoal">100K+</div>
              <div className="font-sketch text-charcoal-medium">Followers</div>
            </div>
            <div className="sketch-container text-center transform -rotate-1">
              <div className="font-display text-4xl font-bold text-charcoal">600+</div>
              <div className="font-sketch text-charcoal-medium">Sketches</div>
            </div>
            <div className="sketch-container text-center transform rotate-1">
              <div className="font-display text-4xl font-bold text-charcoal">50+</div>
              <div className="font-sketch text-charcoal-medium">Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider"></div>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="sketch-container">
              <h2 className="sketch-heading text-4xl md:text-5xl font-bold text-charcoal mb-6">
                About Playing with Pencil
              </h2>
              <div className="space-y-6 font-body text-lg text-charcoal-medium">
                <p className="transform rotate-0.5">
                  Hi, I'm Jeff — an artist, a curious listener, and someone who believes that even the smallest 
                  act of kindness can brighten someone's day.
                </p>
                <p className="transform -rotate-0.5">
                  My journey began not with galleries or grand plans, but with a pencil and a quiet seat 
                  on a Japan Airlines flight to Tokyo. When I noticed a weary stewardess, I was inspired 
                  to sketch her portrait and gift it as a small gesture of appreciation.
                </p>
                <p className="transform rotate-0.5">
                  That moment taught me something profound: art isn't just about creating beautiful things — 
                  it's about creating beautiful moments between people. Today, I continue to sketch strangers 
                  across Singapore and Southeast Asia, spreading positivity one portrait at a time.
                </p>
                <p className="transform -rotate-0.5">
                  When I'm not sketching, I work as a software engineer, but my heart always returns to 
                  the simple joy of capturing human stories with pencil and paper.
                </p>
              </div>
              
              <div className="mt-8 flex items-center space-x-6">
                <a 
                  href="https://instagram.com/playingwithpencil" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="sketch-btn flex items-center space-x-2"
                >
                  <Instagram size={20} />
                  <span>@playingwithpencil</span>
                </a>
              </div>
            </div>
            
            <div className="portfolio-sketch p-8 float-sketch">
              <img 
                src="/gallery/detailed/1.jpg" 
                alt="Jeff Lai Portrait" 
                className="w-full"
              />
              <p className="font-handwritten text-center mt-4 text-charcoal-medium text-xl">
                "A simple thank you...that's all I need"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider"></div>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="sketch-heading text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Services
            </h2>
            <p className="font-body text-lg text-charcoal-medium max-w-2xl mx-auto">
              From quick street sketches to detailed commissioned portraits, 
              I offer various artistic services to capture your special moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="organic-card">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-handwritten text-2xl font-bold text-charcoal">
                      {service.title}
                    </h3>
                    <span className="font-display text-xl font-bold text-charcoal bg-paper-white px-3 py-1 rounded-full transform rotate-12">
                      {service.price}
                    </span>
                  </div>
                  <p className="font-sketch text-charcoal-medium mb-4">
                    {service.duration} • {service.description}
                  </p>
                </div>
                
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2 font-body text-charcoal-medium">
                      <div className="w-2 h-2 bg-charcoal-light rounded-full transform rotate-45"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="sketch-btn w-full"
                  onClick={() => scrollToSection('contact')}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>

          {/* Additional Services */}
          <div className="mt-16 text-center">
            <h3 className="sketch-heading text-3xl font-bold text-charcoal mb-8">
              Additional Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="sketch-container">
                <h4 className="font-handwritten text-2xl font-semibold text-charcoal mb-3">
                  Event Sketching
                </h4>
                <p className="font-body text-charcoal-medium mb-4">
                  Live portrait artist for weddings, corporate functions, and special events. 
                  Entertainment and keepsakes combined.
                </p>
                <button 
                  className="sketch-btn"
                  onClick={() => scrollToSection('contact')}
                >
                  Get Quote
                </button>
              </div>
              <div className="sketch-container">
                <h4 className="font-handwritten text-2xl font-semibold text-charcoal mb-3">
                  Commission Work
                </h4>
                <p className="font-body text-charcoal-medium mb-4">
                  Custom portrait commissions from photos or live sessions. 
                  Perfect gifts and memorials in various sizes and mediums.
                </p>
                <button 
                  className="sketch-btn"
                  onClick={() => scrollToSection('contact')}
                >
                  Inquire
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider"></div>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="sketch-heading text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Portfolio
            </h2>
            <p className="font-body text-lg text-charcoal-medium max-w-2xl mx-auto">
              A collection of moments captured in pencil — each sketch tells a story 
              of human connection and shared joy.
            </p>
          </div>

          <div className="organic-portfolio">
            {portfolioItems.map((item) => (
              <div key={item.id} className="portfolio-sketch">
                <img 
                  src={item.image} 
                  alt={item.title}
                />
                <div className="p-6">
                  <h3 className="font-handwritten text-xl font-semibold text-charcoal mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-charcoal-medium mb-3">
                    {item.description}
                  </p>
                  <span className="font-sketch text-sm bg-paper-cream px-3 py-1 rounded-full text-charcoal-medium transform rotate-3 inline-block">
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="font-body text-charcoal-medium mb-6">
              Want to see more of my work? Follow my journey on social media!
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="https://instagram.com/playingwithpencil" 
                target="_blank" 
                rel="noopener noreferrer"
                className="sketch-btn flex items-center space-x-2"
              >
                <Instagram size={20} />
                <span>Instagram</span>
              </a>
              <a 
                href="https://tiktok.com/@jeffandpencil" 
                target="_blank" 
                rel="noopener noreferrer"
                className="sketch-btn flex items-center space-x-2"
              >
                <Users size={20} />
                <span>TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="sketch-heading text-3xl md:text-4xl font-bold text-charcoal text-center mb-12">
            Trusted by Leading Brands
          </h2>
       
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {brands.map((brand, index) => (
              <div key={index} className="brand-item">
                <div className="brand-logo-container">
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    className="brand-logo grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <p className="font-sketch text-sm text-charcoal-medium text-center mt-2">
                  {brand.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider"></div>

      {/* Featured Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="sketch-heading text-3xl md:text-4xl font-bold text-charcoal text-center mb-12">
            Featured In
          </h2>
      
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="brand-item">
                <div className="brand-logo-container">
                  <img 
                    src={feature.logo} 
                    alt={feature.name}
                    className="brand-logo grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <p className="font-sketch text-sm text-charcoal-medium text-center mt-2">
                  {feature.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wavy Divider */}
      <div className="wavy-divider"></div>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="sketch-heading text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Get in Touch
            </h2>
            <p className="font-body text-lg text-charcoal-medium">
              Ready to capture your moment? Let's create something beautiful together.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="sketch-container mb-8">
                <h3 className="font-handwritten text-2xl font-semibold text-charcoal mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin size={20} className="text-charcoal-medium" />
                    <span className="font-body text-charcoal-medium">Singapore</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail size={20} className="text-charcoal-medium" />
                    <span className="font-body text-charcoal-medium">hello@playingwithpencil.art</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Instagram size={20} className="text-charcoal-medium" />
                    <span className="font-body text-charcoal-medium">@playingwithpencil</span>
                  </div>
                </div>
              </div>

              <div className="sketch-container">
                <h3 className="font-handwritten text-xl font-semibold text-charcoal mb-4">
                  Available For
                </h3>
                <div className="space-y-2 font-body text-charcoal-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-charcoal-light rounded-full"></div>
                    <span>Local events and sessions in Singapore</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-charcoal-light rounded-full"></div>
                    <span>Regional travel (Southeast Asia)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-charcoal-light rounded-full"></div>
                    <span>Online consultations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-charcoal-light rounded-full"></div>
                    <span>Custom commissions worldwide</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="sketch-container">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4">
        <div className="wavy-divider mb-8"></div>
        <div className="max-w-6xl mx-auto text-center">
          <div className="font-handwritten text-3xl font-bold text-charcoal mb-4">
            Playing with Pencil
          </div>
          <p className="font-sketch text-charcoal-medium mb-6">
            Spreading joy one sketch at a time • Singapore
          </p>
          <div className="flex justify-center space-x-6 mb-6">
            <a 
              href="https://instagram.com/playingwithpencil" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-charcoal-medium hover:text-charcoal transition-colors transform hover:rotate-12"
            >
              <Instagram size={24} />
            </a>
            <a 
              href="mailto:hello@playingwithpencil.art"
              className="text-charcoal-medium hover:text-charcoal transition-colors transform hover:rotate-12"
            >
              <Mail size={24} />
            </a>
          </div>
          <p className="font-body text-sm text-charcoal-light">
            © 2025 Jeff Lai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App

