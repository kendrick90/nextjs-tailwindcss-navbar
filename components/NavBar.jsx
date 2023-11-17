import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { TbCloudQuestion } from "react-icons/tb";
import { MdOutlineSettings, MdPalette, MdClose } from "react-icons/md";
import {
  GiHamburgerMenu,
  GiLightningHelix,
  GiBleedingEye,
} from "react-icons/gi";

function NavBar() {
  const [navbar, setNavbar] = useState(false);
  const pathname = usePathname();

  // Define your routes with icons
  const routes = [
    { path: "/modes", label: "Modes", Icon: GiBleedingEye },
    { path: "/effects", label: "Effects", Icon: GiLightningHelix },
    { path: "/colors", label: "Colors", Icon: MdPalette },
    { path: "/settings", label: "Settings", Icon: MdOutlineSettings },
    { path: "/status", label: "Status", Icon: TbCloudQuestion },
  ];

  return (
    <div>
      {/* NAVBAR */}
      {/* background black fill entire top*/}
      <nav className="w-full bg-black fixed">
        {/* center logo and menu items slightly away from edges and set max size on lg screens */}
        <div className="justify-between px-4 mx-auto lg:max-w-7xl md:items-center md:flex md:px-8">
          {/* LOGO AND HAMBURGER BUTTON */}
          <div>
            <div className="flex items-center justify-between py-3 md:py-5 md:block">
              {/* LOGO */}
              <Link href="/">
                <h2 className="text-2xl text-cyan-600 font-bold ">
                  LED Controller
                </h2>
              </Link>

              {/* HAMBURGER BUTTON FOR MOBILE */}
              <div className="md:hidden">
                <button
                  className="p-2 text-gray-700 rounded-md outline-none"
                  onClick={() => setNavbar(!navbar)}
                >
                  {/* Render close or hamburger icon based on navbar state */}
                  {navbar ? <MdClose /> : <GiHamburgerMenu />}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Menu Items */}
          <div>
            <div
              className={`flex-1 justify-self-center md:block ${
                navbar ? "p-12 md:p-0 block" : "hidden"
              }`}
            >
              <ul className="h-screen md:h-auto items-center justify-center md:flex ">
                {routes.map(({ path, label, Icon }) => (
                  <Link key={path} href={path} onClick={() => setNavbar(false)}>
                    <li
                      className={`rounded-lg text-xl text-white py-2 px-6 text-center md:border-b-0 cursor-pointer ${
                        pathname === path
                          ? "bg-purple-900"
                          : "hover:bg-purple-600"
                      } border-purple-900 md:hover:text-purple-600 md:hover:bg-transparent flex items-center justify-center md:justify-start`}
                    >
                      {Icon && <Icon className="mr-2" />} {/* Render icon */}
                      {label}
                    </li>
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
