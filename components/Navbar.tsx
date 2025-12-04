import React from 'react';
import { Activity, Menu, X, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname.startsWith('/auth');

  // If in app dashboard, we might render a different sidebar-based layout, 
  // but for this MVP we keep a top navbar for simplicity or landing.
  if (location.pathname.startsWith('/app')) return null;

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="bg-brand-600 p-1.5 rounded-lg">
             <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="self-center text-xl font-semibold whitespace-nowrap text-white">Quant<span className="text-brand-500">Pilot</span></span>
        </Link>
        
        {/* Mobile menu button */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-400 hover:text-white focus:outline-none"
        >
            {isOpen ? <X /> : <Menu />}
        </button>

        <div className={`${isOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}>
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-slate-800 rounded-lg bg-slate-800 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
            <li>
              <a href="#features" className="block py-2 px-3 text-gray-300 rounded hover:text-white md:p-0">Features</a>
            </li>
            <li>
              <a href="#pricing" className="block py-2 px-3 text-gray-300 rounded hover:text-white md:p-0">Pricing</a>
            </li>
            {!isAuthPage && (
                 <li>
                 <Link to="/auth/login" className="block py-2 px-3 text-brand-400 font-bold hover:text-brand-300 md:p-0">Login</Link>
               </li>
            )}
            {!isAuthPage && (
                <li>
                    <Link to="/auth/signup" className="block py-2 px-4 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-full transition-colors">
                        Get Started
                    </Link>
                </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;