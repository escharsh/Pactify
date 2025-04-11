import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from 'lucide-react';

const Header = () => {
    return (
        <nav className="flex items-center w-full justify-between bg-black text-white">
            {/* Logo */}
            <div className="flex items-center">
                <img
                    src="/logo.jpg"
                    alt="Pactify logo"
                    className="w-28 h-16 object-contain bg-none"
                />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex space-x-8">
                <Link to="/product" className="text-white hover:text-gray-300">
                    Product
                </Link>
                <Link to="/contact" className="text-white hover:text-gray-300">
                    Contact us
                </Link>
                <Link to="/pricing" className="text-white hover:text-gray-300">
                    Pricing
                </Link>
                <Link to="/about" className="text-white hover:text-gray-300">
                    About
                </Link>
            </div>

            {/* Sign Up Button */}
            <div>
                <Link
                    to="/signup"
                    className="bg-white text-[#0A031B] place-items-center px-4 py-2 justify-center rounded-full hover:bg-gray-200 flex items-center gap-1"
                >
                    Sign up
                    <ChevronRight />
                </Link>
            </div>
        </nav>
    );
};

export default Header;
