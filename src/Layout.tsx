import { NavLink, Outlet } from 'react-router'; // Corrected import
import { useState } from 'react';
import {
  Cpu,
  LayoutDashboard,
  Gamepad2,
  Terminal,
  FileText,
  ChartLine,
  Menu,
  X,
} from 'lucide-react';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const commonNavLinkClass =
    'flex w-full items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-slate-700';
  const activeNavLinkClass = 'bg-slate-700 font-semibold';

  // Type for NavLink className function
  type NavLinkRenderProps = { isActive: boolean; isPending: boolean };

  return (
    <main className='flex min-h-screen bg-zinc-50'>
      {/* Mobile Hamburger Button - visible only on mobile and when menu is closed */}
      {!isMobileMenuOpen && (
        <div className='fixed top-4 left-4 z-50 md:hidden'>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className='rounded-md p-2 text-slate-700 hover:bg-slate-200 focus:ring-2 focus:ring-slate-500 focus:outline-none focus:ring-inset'
            aria-label='Open menu'
          >
            <Menu size={28} />
          </button>
        </div>
      )}

      {/* Sidebar Navigation / Mobile Menu Panel */}
      <nav
        className={`/* Mobile: fixed, overlay, high z-index */ /* Responsive width for mobile menu */ /* Appearance */ fixed inset-y-0 left-0 z-40 flex w-4/5 max-w-xs transform flex-col justify-between bg-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out sm:w-3/5 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} /* Slide animation */ /* Desktop: sidebar */ /* Ensure is applied on desktop */ static flex md:relative md:flex md:w-64 md:translate-x-0 md:border-r md:border-zinc-200 md:shadow-none`}
        aria-label='Main navigation'
      >
        {/* Top section of Nav: Logo/Title and Close button for mobile */}
        <div className='flex items-center justify-between border-b border-slate-700 px-4 py-3'>
          <NavLink
            to='/'
            className='flex items-center gap-2 text-xl font-bold' // Slightly smaller font for nav header
            onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
          >
            <Cpu size={24} />
            Soma
          </NavLink>
          {/* Close Button for Mobile Menu - inside the nav panel */}
          {isMobileMenuOpen && ( // Only show X when menu is open (effectively mobile only due to parent class)
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className='rounded-md p-2 text-white hover:bg-slate-700 md:hidden'
              aria-label='Close menu'
            >
              <X size={28} />
            </button>
          )}
        </div>

        {/* Navigation Links - scrollable if content overflows */}
        <div className='flex flex-grow flex-col gap-1 overflow-y-auto p-3'>
          {' '}
          {/* Adjusted padding and gap */}
          <NavLink
            to='/'
            end // Important for root path matching
            className={({ isActive }: NavLinkRenderProps) =>
              `${commonNavLinkClass} ${isActive ? activeNavLinkClass : ''}`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <LayoutDashboard className='h-5 w-5 flex-shrink-0' />
            Dashboard
          </NavLink>
          <NavLink
            to='/control'
            className={({ isActive }: NavLinkRenderProps) =>
              `${commonNavLinkClass} ${isActive ? activeNavLinkClass : ''}`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Gamepad2 className='h-5 w-5 flex-shrink-0' />
            Control Panel
          </NavLink>
          <NavLink
            to='/logs'
            className={({ isActive }: NavLinkRenderProps) =>
              `${commonNavLinkClass} ${isActive ? activeNavLinkClass : ''}`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Terminal className='h-5 w-5 flex-shrink-0' />
            System Logs
          </NavLink>
          <NavLink
            to='/analytics'
            className={({ isActive }: NavLinkRenderProps) =>
              `${commonNavLinkClass} ${isActive ? activeNavLinkClass : ''}`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ChartLine className='h-5 w-5 flex-shrink-0' />
            Analytics
          </NavLink>
          <NavLink
            to='/documentation'
            className={({ isActive }: NavLinkRenderProps) =>
              `${commonNavLinkClass} ${isActive ? activeNavLinkClass : ''}`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FileText className='h-5 w-5 flex-shrink-0' />
            Documentation
          </NavLink>
        </div>

        {/* Settings Link (bottom) */}
        <div className='border-t border-slate-700 p-3'>
          {' '}
          {/* Consistent padding */}
          <NavLink
            to='/settings'
            className={({ isActive }: NavLinkRenderProps) =>
              `${commonNavLinkClass} ${isActive ? activeNavLinkClass : ''}`
            }
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* Consider adding an icon for Settings if other items have them */}
            Settings
          </NavLink>
        </div>
      </nav>

      {/* Content Area */}
      <div>
        <Outlet />
      </div>

      {/* Backdrop for Mobile Menu - covers content area */}
      {/* {isMobileMenuOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/60 md:hidden' // z-index lower than menu panel (z-40)
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden='true'
        ></div>
      )} */}
    </main>
  );
}

export default Layout;
