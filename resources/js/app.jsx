import '../css/app.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Navbar from './components/navbar';
import Hero from './components/hero';
import Features from './components/features';
import Footer from './components/footer';

const App = () => {
    return (
        <div className="min-h-screen">
            <Navbar user={null} />
            <Hero />
            <Features />
            <Footer />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
