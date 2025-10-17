import Navbar from '../components/Sketch_Interface/Navbar'
import Hero from '../components/Sketch_Interface/Hero'
import ServicesOverview from '../components/Sketch_Interface/ServicesOverview'

import PhoneGallery from '../components/Sketch_Interface/PhoneGallery'
import ContactNote from '../components/Sketch_Interface/ContactNote'
import Footer from '../components/Sketch_Interface/Footer'
import { PressProvider } from '../contexts/PressContext'

export default function App() {
  return (
   <>
      <Navbar />
      <PressProvider>
        <Hero />
      </PressProvider>
     
      <ServicesOverview />
      {/* <Sketchbook /> */} 
      {/* remove this for now */}
      <PhoneGallery />
      
      <ContactNote />
      <Footer />
      </>
   
  )
}
