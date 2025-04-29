import { NavLink, Outlet } from "react-router";

function Layout() {

    return (
        <main className="flex bg-zinc-50">
            <nav className="flex flex-col flex-shrink-0 bg-white gap-3 p-4 border-r border-zinc-200 min-h-screen">
                <h1 className="font-bold text-2xl text-zinc-900">h1<span className="text-orange-600">.</span>soma</h1>
                <NavLink to="/" className={`w-full rounded-lg border px-2 border-zinc-200 hover:border-orange-600 transition-all hover:shadow-md`}>
                    Live
                </NavLink>
                <NavLink to="/log" className={`w-full rounded-lg border px-2 border-zinc-200 hover:border-orange-600 transition-all hover:shadow-md`}>
                    Logs
                </NavLink>
                <NavLink to="/settings" className={`w-full rounded-lg border px-2 border-zinc-200 hover:border-orange-600 transition-all hover:shadow-md`}>
                    Settings
                </NavLink>
            </nav>
            <Outlet />
        </main>
    );
}

export default Layout;
