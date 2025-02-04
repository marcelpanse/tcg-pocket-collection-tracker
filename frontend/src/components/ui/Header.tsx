import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'

import { Login } from '@/components/Login.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { logout } from '@/lib/Auth.ts'
import type { Models } from 'appwrite'
import type { FC, SVGProps } from 'react'
import { Link } from 'react-router-dom'
import type { JSX } from 'react/jsx-runtime'

interface Props {
  user: Models.User<Models.Preferences> | null
  setUser: (user: Models.User<Models.Preferences> | null) => void
}

export const Header: FC<Props> = ({ user, setUser }) => (
  <>
    <header className="flex h-20 w-full justify-between shrink-0 items-center px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="grid gap-2 py-6">
            <Link to="/" className="flex w-full items-center py-2 text-lg font-semibold">
              Overview
            </Link>
            {/*<Link to="/pokedex" className="flex w-full items-center py-2 text-lg font-semibold">*/}
            {/*  Pokedex*/}
            {/*</Link>*/}
            <Link to="/collection" className="flex w-full items-center py-2 text-lg font-semibold">
              Collection
            </Link>
            <Link to="/trade" className="flex w-full items-center py-2 text-lg font-semibold">
              Trade
            </Link>
          </div>
        </SheetContent>
      </Sheet>
      <NavigationMenu className="hidden lg:flex">
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <Link to="/">
              <Button className="cursor-pointer" variant="ghost">
                Overview
              </Button>
            </Link>
          </NavigationMenuLink>
          {/*<NavigationMenuLink asChild>*/}
          {/*  <Link to="/pokedex">*/}
          {/*    <Button className="cursor-pointer" variant="ghost">*/}
          {/*      Pokedex*/}
          {/*    </Button>*/}
          {/*  </Link>*/}
          {/*</NavigationMenuLink>*/}
          <NavigationMenuLink asChild>
            <Link to="/collection">
              <Button className="cursor-pointer" variant="ghost">
                Collection
              </Button>
            </Link>
          </NavigationMenuLink>
          <NavigationMenuLink asChild>
            <Link to="/trade">
              <Button className="cursor-pointer" variant="ghost">
                Trade
              </Button>
            </Link>
          </NavigationMenuLink>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="ml-auto flex items-center gap-2">
        {user ? (
          <Button
            variant="outline"
            onClick={async () => {
              await logout()
              setUser(null)
            }}
          >
            Logout
          </Button>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Login</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Login / Sign up</DialogTitle>
              </DialogHeader>
              <Login />
            </DialogContent>
          </Dialog>
        )}

        <ModeToggle />
      </div>
    </header>
  </>
)

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
      <title>Menu</title>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}
