import HamburgerMenu from '@/components/HamburgerMenu.tsx'
import { Login } from '@/components/Login.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { NavigationMenu, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu.tsx'
import { logout } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { use } from 'react'
import { Link } from 'react-router'

export function Header() {
  const { user, setUser, isLoginDialogOpen, setIsLoginDialogOpen } = use(UserContext)
  return (
    <>
      <header className="flex h-20 w-full shrink-0 flex-wrap items-center px-4 md:px-6">
        <div className="shrink font-bold pr-4 hidden md:block">TCG Pocket Collection Tracker</div>
        <NavigationMenu className="max-w-full justify-start">
          <NavigationMenuList>
            <NavigationMenuLink asChild>
              <Link to="/">
                <Button variant="ghost">Overview</Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link to="/collection">
                <Button variant="ghost">Collection</Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="hidden sm:block">
              <Link to="/trade">
                <Button variant="ghost">Trade</Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="items-center gap-2 hidden sm:flex">
          <Link to="/community">
            <Button variant="ghost">Community</Button>
          </Link>

          {user ? (
            <Button
              className="hidden sm:block"
              variant="ghost"
              onClick={async () => {
                await logout()
                setUser(null)
              }}
            >
              Logout
            </Button>
          ) : (
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button>Login</Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-slate-600 shadow-none">
                <DialogHeader>
                  <DialogTitle>Login / Sign up</DialogTitle>
                </DialogHeader>
                <Login />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <HamburgerMenu />
      </header>
    </>
  )
}
