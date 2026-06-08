import React from 'react'
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import CTA from './components/Cta';

export default function page() {


  return (
    <div>
      <Header/>
      <Hero/>
      <Features/>
      <CTA/>
      <Footer/>
    </div>
  )
}
