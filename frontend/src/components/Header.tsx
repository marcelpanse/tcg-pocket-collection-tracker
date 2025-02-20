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
import { useI18n } from '@/hooks/use-i18n'
import { logout } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { Globe, LogOut, UserRoundPen } from 'lucide-react'
import { use } from 'react'
import { Link } from 'react-router'

export function Header() {
  const { user, setUser, isLoginDialogOpen, setIsLoginDialogOpen, setIsProfileDialogOpen } = use(UserContext)
  const { t, changeLanguage } = useI18n()

  return (
    <>
      <header className="flex h-20 w-full shrink-0 flex-wrap items-center px-4 md:px-6">
        <div className="shrink font-bold pr-4 hidden md:block">TCG Pocket Collection Tracker</div>
        <NavigationMenu className="max-w-full justify-start">
          <NavigationMenuList>
            <NavigationMenuLink asChild>
              <Link to="/">
                <Button variant="ghost">{t('header.overview')}</Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link to="/collection">
                <Button variant="ghost">{t('header.collection')}</Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="hidden sm:block">
              <Link to="/trade">
                <Button variant="ghost">{t('header.trade')}</Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="items-center gap-2 hidden sm:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{t('header.selectLanguage')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeLanguage('es')}>{t('header.languages.es')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('en')}>{t('header.languages.en')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/community">
            <Button variant="ghost">{t('header.community')}</Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <UserRoundPen />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>{t('header.myAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>{t('header.editProfile')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await logout()
                      setUser(null)
                    }}
                  >
                    {t('header.logOut')}
                    <LogOut />
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button>{t('header.login')}</Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-slate-600 shadow-none">
                <DialogHeader>
                  <DialogTitle>{t('header.signUp')}</DialogTitle>
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
