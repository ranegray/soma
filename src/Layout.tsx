import { NavLink, Outlet } from "react-router";

function Layout() {

    return (
        <main className="flex">
            <nav className="flex flex-col flex-shrink-0 bg-slate-700 text-white p-4 h-screen">
                <h1 className="font-bold text-2xl mb-">h1.soma</h1>
                <NavLink to="/" className={`w-full rounded-md hover:bg-white hover:text-black`}>
                    live feed
                </NavLink>
                <NavLink to="/log" className={`w-full rounded-md hover:bg-white hover:text-black`}>
                    logging
                </NavLink>
                <NavLink to="/label" className={`w-full rounded-md hover:bg-white hover:text-black`}>
                    labeling
                </NavLink>
            </nav>
            <Outlet />
        </main>
    );
}

export default Layout;
