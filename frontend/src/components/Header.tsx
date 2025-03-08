import HamburgerMenu from '@/components/HamburgerMenu.tsx'
import { Login } from '@/components/Login.tsx'
import PokemonCardDetector from '@/components/PokemonCardDetectorComponent.tsx'
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
import Export from '@/pages/export/Export'
import Import from '@/pages/import/Import'
import { Globe, LogOut, UserRoundPen } from 'lucide-react'
import { use, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function Header() {
  const { user, setUser, isLoginDialogOpen, setIsLoginDialogOpen, setIsProfileDialogOpen } = use(UserContext)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false)
  const { t, i18n } = useTranslation('header')
  const changeLanguage = (lng: string) => i18n.changeLanguage(lng)

  return (
    <>
      <header className="flex h-20 w-full shrink-0 flex-wrap items-center px-4 md:px-6">
        <div className="shrink font-bold pr-4 hidden md:block">TCG Pocket Collection Tracker</div>
        <NavigationMenu className="max-w-full justify-start">
          <NavigationMenuList>
            <NavigationMenuLink asChild>
              <Link to="/">
                <Button variant="ghost">{t('overview')}</Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="hidden sm:block">
              <Link to="/collection">
                <Button variant="ghost">{t('collection')}</Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="hidden sm:block">
              <Link to="/trade">
                <Button variant="ghost">{t('trade')}</Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
          <PokemonCardDetector />
        </NavigationMenu>
        <div className="items-center gap-2 flex">
          <Link to="/community" className="hidden sm:block">
            <Button variant="ghost">{t('community')}</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeLanguage('en')}>{t('languages.en')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('es')}>{t('languages.es')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('pt-BR')}>{t('languages.pt-br')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')}>{t('languages.fr')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <UserRoundPen />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)}>{t('editProfile')}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>{t('export')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>{t('import')}</DropdownMenuItem>
                  <DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await logout()
                        setUser(null)
                      }}
                    >
                      {t('logOut')}
                      <LogOut />
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button>{t('login')}</Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-slate-600 shadow-none">
                <DialogHeader>
                  <DialogTitle>{t('signUp')}</DialogTitle>
                </DialogHeader>
                <Login />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <HamburgerMenu />
      </header>
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="border-2 border-slate-600 shadow-none">
          <DialogHeader>
            <DialogTitle>{t('import')}</DialogTitle>
          </DialogHeader>
          <Import />
        </DialogContent>
      </Dialog>
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="border-2 border-slate-600 shadow-none">
          <DialogHeader>
            <DialogTitle>{t('export')}</DialogTitle>
          </DialogHeader>
          <Export />
        </DialogContent>
      </Dialog>
    </>
  )
}
