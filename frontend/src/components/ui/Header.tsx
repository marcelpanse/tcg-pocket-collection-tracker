/**
 * v0 by Vercel.
 * @see https://v0.dev/t/iEOJ3UhOd4C
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {Link} from "react-router-dom"
import { NavigationMenu, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { SVGProps } from "react"
import { JSX } from "react/jsx-runtime"
import {ModeToggle} from "@/components/mode-toggle"

export function Header() {
  return (
    <header className="flex h-20 w-full justify-between shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <Link to="#" >
            <MountainIcon className="h-6 w-6" />
            <span className="sr-only">Acme Inc</span>
          </Link>
          <div className="grid gap-2 py-6">
            <Link to="/overview" className="flex w-full items-center py-2 text-lg font-semibold" >
            Overview
            </Link>
            <Link to="/pokedex" className="flex w-full items-center py-2 text-lg font-semibold" >
              Pokedex
            </Link>
            <Link to="/collection" className="flex w-full items-center py-2 text-lg font-semibold" >
              Collection
            </Link>
            <Link to="/trade" className="flex w-full items-center py-2 text-lg font-semibold" >
              Trade
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <Link to="#" className="mr-6 hidden lg:flex" >
        <MountainIcon className="h-6 w-6" />
        <span className="sr-only">Acme Inc</span>
      </Link>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <Link
              to="/overview"
            >
              <Button className="cursor-pointer" variant="ghost">Overview</Button>
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              to="/pokedex"
              
              
            >
              <Button className="cursor-pointer" variant="ghost">Pokedex</Button>
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              to="/collection"
              
            >
              <Button className="cursor-pointer" variant="ghost">Collection</Button>
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link
              to="/trade"
              
              
            >
              <Button className="cursor-pointer" variant="ghost">Trade</Button>
            </Link>
          </NavigationMenuLink>
          
        </NavigationMenuList>
      </NavigationMenu>
      <div className="ml-auto" >

            <ModeToggle />
          </div>
    </header>
  )
}

function MenuIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}


function MountainIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}