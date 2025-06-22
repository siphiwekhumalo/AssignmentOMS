/**
 * Navigation component for the Document Text Extractor application
 * 
 * Provides:
 * - Application branding with icon and title
 * - Navigation links between upload and results pages
 * - Active state highlighting for current page
 * - Responsive design with mobile-friendly layout
 */

import { Link, useLocation } from "wouter";
import { FileText } from "lucide-react";

/**
 * Main navigation bar component
 * Displays at the top of every page with consistent branding and navigation
 */
export default function Navigation() {
  const [location] = useLocation(); // Get current route for active state
  
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Application branding */}
          <div className="flex items-center space-x-3">
            <FileText className="text-primary-500 text-xl" />
            <h1 className="text-lg font-semibold text-slate-800">Document Text Extractor</h1>
          </div>
          
          {/* Navigation links - hidden on small screens */}
          <div className="hidden sm:flex space-x-4">
            <Link href="/">
              <button className={`font-medium ${
                location === '/' 
                  ? 'text-slate-800' // Active state
                  : 'text-slate-600 hover:text-slate-800' // Inactive state with hover
              }`}>
                Upload
              </button>
            </Link>
            <Link href="/results">
              <button className={`font-medium ${
                location === '/results' 
                  ? 'text-slate-800' // Active state
                  : 'text-slate-600 hover:text-slate-800' // Inactive state with hover
              }`}>
                Results
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
