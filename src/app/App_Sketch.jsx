import Navbar from '../components/Sketch_Interface/Navbar'
import Hero from '../components/Sketch_Interface/Hero'
import Socials from '../components/Sketch_Interface/Socials'
import ServicesOverview from '../components/Sketch_Interface/ServicesOverview'
import Sketchbook from '../components/Sketch_Interface/Sketchbook'
import PhoneGallery from '../components/Sketch_Interface/PhoneGallery'
import ContactNote from '../components/Sketch_Interface/ContactNote'
import Footer from '../components/Sketch_Interface/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
     
      <ServicesOverview />
      {/* <Sketchbook /> */} 
      {/* remove this for now */}
      <PhoneGallery />
      <Socials />
      <ContactNote />
      <Footer />
    </>
  )
}
