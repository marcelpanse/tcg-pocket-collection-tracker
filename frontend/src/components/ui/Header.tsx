import { Login } from '@/components/Login.tsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { NavigationMenu, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { logout } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext'
import { ChevronRight } from 'lucide-react'
import { use } from 'react'
import { Link } from 'react-router'

export function Header() {
  const { user, signOut } = use(UserContext)
  return (
    <>
      <header className="flex h-20 w-full shrink-0 flex-wrap items-center justify-between px-4 md:px-6">
        <NavigationMenu>
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
            <NavigationMenuLink asChild>
              <Link to="/trade">
                <Button variant="ghost">Trade</Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => window.open('https://github.com/marcelpanse/tcg-pocket-collection-tracker/discussions', '_blank')}>
            Questions <ChevronRight />
          </Button>

          {user ? (
            <Button
              variant="outline"
              onClick={async () => {
                await logout()
                signOut()
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
        </div>
      </header>
    </>
  )
}
