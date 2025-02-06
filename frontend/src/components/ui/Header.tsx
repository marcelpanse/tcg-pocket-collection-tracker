import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'

import { Login } from '@/components/Login.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { logout } from '@/lib/Auth.ts'
import type { Models } from 'appwrite'
import type { FC } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  user: Models.User<Models.Preferences> | null
  setUser: (user: Models.User<Models.Preferences> | null) => void
}

export const Header: FC<Props> = ({ user, setUser }) => (
  <>
    <header className="flex h-20 w-full justify-between shrink-0 items-center px-4 md:px-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuLink asChild>
            <Link to="/">
              <Button className="cursor-pointer" variant="ghost">
                Overview
              </Button>
            </Link>
          </NavigationMenuLink>
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
      <div className="flex items-center gap-2">
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

        {/* <ModeToggle /> */}
      </div>
    </header>
  </>
)
