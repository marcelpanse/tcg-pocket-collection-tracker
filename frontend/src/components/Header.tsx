import HamburgerMenu from '@/components/HamburgerMenu.tsx'
import { Login } from '@/components/Login.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NavigationMenu, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu.tsx'
import { logout } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { LogOut, UserRoundPen } from 'lucide-react'
import { use } from 'react'
import { Link } from 'react-router'

export function Header() {
  const { user, setUser, isLoginDialogOpen, setIsLoginDialogOpen, setIsProfileDialogOpen } = use(UserContext)
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserRoundPen />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>Edit profile</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout()
                      setUser(null)
                    }}
                  >
                    Log out
                    <LogOut />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
