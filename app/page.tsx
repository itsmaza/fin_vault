import React from 'react';

import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import CTA from './components/Cta';
import HeaderWrapper from './components/HeaderWrapper';

export default function page() {
    return (
        <div>
         <HeaderWrapper />
            <Hero />
            <Features />
            <CTA />
            <Footer />
        </div>
    );
}
