import { Link, useLocation } from "wouter";
import { FileText } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <FileText className="text-primary-500 text-xl" />
            <h1 className="text-lg font-semibold text-slate-800">Document Text Extractor</h1>
          </div>
          <div className="hidden sm:flex space-x-4">
            <Link href="/">
              <button className={`font-medium ${location === '/' ? 'text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}>
                Upload
              </button>
            </Link>
            <Link href="/results">
              <button className={`font-medium ${location === '/results' ? 'text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}>
                Results
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
