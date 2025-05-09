import { NavLink, Outlet } from 'react-router';

function Layout() {
  return (
    <main className='flex bg-zinc-50'>
      <nav className='flex min-h-screen flex-shrink-0 flex-col justify-between border-r border-zinc-200 bg-slate-800 text-white md:w-64'>
        <div className='flex flex-col gap-2'>
          <NavLink
            to='/'
            className='border-b border-slate-300 px-4 py-2 text-3xl font-bold'
          >
            soma<span className='text-orange-600'>.</span>
          </NavLink>
          <NavLink
            to='/'
            className={`w-full rounded-md px-4 transition-all hover:bg-slate-700`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to='/control'
            className={`w-full rounded-md px-4 transition-all hover:bg-slate-700`}
          >
            Control Panel
          </NavLink>
          <NavLink
            to='/logs'
            className={`w-full rounded-md px-4 transition-all hover:bg-slate-700`}
          >
            System Logs
          </NavLink>
          <NavLink
            to='/analytics'
            className={`w-full rounded-md px-4 transition-all hover:bg-slate-700`}
          >
            Analytics
          </NavLink>
          <NavLink
            to='/documentation'
            className={`w-full rounded-md px-4 transition-all hover:bg-slate-700`}
          >
            Documentation
          </NavLink>
        </div>
        <div className='flex flex-col gap-2'>
          <NavLink
            to='/settings'
            className={`w-full rounded-md px-4 transition-all hover:bg-slate-700`}
          >
            Settings
          </NavLink>
        </div>
      </nav>
      <Outlet />
    </main>
  );
}

export default Layout;
