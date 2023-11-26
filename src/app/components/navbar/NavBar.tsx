"use client";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/react";

import ThemeSwitcher from "../utils/ThemeSwitcher";

export default function NavBar() {
  return (
    <div className="flex flex-row w-full items-center justify-between px-4 xs:px-8 sm:px-12 md:px-18 lg:px-24 xl:px-36 py-4">
      <div className="flex flex-row">
        <div>
          <p className="font-bold text-inherit">EPB</p>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <ThemeSwitcher />

        <Button as={Link} color="secondary" href="/" variant="flat">
          New
        </Button>
      </div>
    </div>
  );
}
