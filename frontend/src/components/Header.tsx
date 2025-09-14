import loadable from '@loadable/component'
import { Globe, LogOut, UserRoundPen } from 'lucide-react'
import { useState } from 'react'
import GitHubButton from 'react-github-btn'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import HamburgerMenu from '@/components/HamburgerMenu.tsx'
import { Login } from '@/components/Login.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
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
import Export from '@/pages/export/Export'
import Import from '@/pages/import/Import'
import { useProfileDialog } from '@/services/account/useAccount'
import { useLoginDialog, useLogout, useUser } from '@/services/auth/useAuth'
import { useActionableTradeCount } from '@/services/trade/useTrade.ts'
import { Badge } from './ui/badge'

const CardDetectorComponent = loadable(() => import('@/components/CardDetectorComponent.tsx'))

export function Header() {
  const location = useLocation()
  const { t, i18n } = useTranslation('header')
  const { data: user } = useUser()
  const { data: actionableTradeCount } = useActionableTradeCount()
  const logoutMutation = useLogout()

  const { isLoginDialogOpen, setIsLoginDialogOpen } = useLoginDialog()
  const { setIsProfileDialogOpen } = useProfileDialog()

  const [isImportDialogOpen, setIsImportDialogOpen] = useState<boolean>(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false)
  const [isAboutUsDialogOpen, setIsAboutUsDialogOpen] = useState<boolean>(false)

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng)

  const languages = [
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'en-US', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'pt-BR', name: 'Português' },
  ] // alphabetical language order in their native form for UX accessibility

  const isOverviewPage = location.pathname === '/'

  return (
    <>
      <header id="header" className="flex max-w-7xl mx-auto min-h-fit h-14 md:h-20 shrink-0 flex-wrap items-center px-4 md:px-6">
        <HamburgerMenu />
        <Link to="/" className="flex items-center gap-2">
          <img src="/pokemon-icon128.png" alt="Logo" className="h-5 hidden min-[420px]:block" />
          <div className="shrink font-bold pr-4 hidden xl:block">TCG Pocket Collection Tracker</div>
        </Link>
        <NavigationMenu className="max-w-full justify-start">
          <NavigationMenuList>
            {/* dynamic item for mobile that switches between overview and collection depending on the current page */}
            <NavigationMenuLink asChild className="block sm:hidden">
              <Link to={isOverviewPage ? '/collection' : '/'}>
                <Button className="px-2 sm:px-4" variant="ghost">
                  {isOverviewPage ? t('collection') : t('overview')}
                </Button>
              </Link>
            </NavigationMenuLink>

            <NavigationMenuLink asChild className="hidden sm:block">
              <Link to="/">
                <Button className="px-2 sm:px-4" variant="ghost">
                  {t('overview')}
                </Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="hidden sm:block">
              <Link to="/collection">
                <Button className="px-2 sm:px-4" variant="ghost">
                  {t('collection')}
                </Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="hidden sm:block">
              <Link to="/decks">
                <Button className="px-2 sm:px-4" variant="ghost">
                  {t('Decks')}
                </Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className={`${actionableTradeCount ? 'block' : 'hidden'} sm:block`}>
              <Link to="/trade">
                <Button className="px-2 sm:px-4" variant="ghost">
                  {t('trade')}
                  <Badge
                    className={`h-5 min-w-5 rounded-full font-mono tabular-nums -mt-2 ${actionableTradeCount ? 'flex' : 'hidden'} justify-center`}
                    variant="destructive"
                  >
                    {actionableTradeCount}
                  </Badge>
                </Button>
              </Link>
            </NavigationMenuLink>
            <CardDetectorComponent />
            <NavigationMenuLink asChild className="hidden lg:block">
              <Link to="https://blog.tcgpocketcollectiontracker.com" className="hidden md:block">
                <Button className="px-2 sm:px-4" variant="ghost">
                  {t('blog')}
                </Button>
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild className="hidden lg:block">
              <Link to="https://community.tcgpocketcollectiontracker.com" className="hidden md:block">
                <Button className="px-2 sm:px-4" variant="ghost">
                  {t('community')}
                </Button>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="items-center gap-2 flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="px-2 sm:px-4" variant="ghost" size="icon">
                <Globe />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {languages.map((lang) => (
                <DropdownMenuItem key={lang.code} selected={i18n.language === lang.code} onClick={() => changeLanguage(lang.code)}>
                  {lang.name}
                </DropdownMenuItem>
              ))}
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsAboutUsDialogOpen(true)}>{t('aboutUs')}</DropdownMenuItem>

                  <DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
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
              <DialogContent className="border-1 border-neutral-700 shadow-none">
                <DialogHeader>
                  <DialogTitle>{t('signUp')}</DialogTitle>
                </DialogHeader>
                <Login />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="border-1 border-neutral-700 shadow-none">
          <DialogHeader>
            <DialogTitle>{t('import')}</DialogTitle>
          </DialogHeader>
          <Import />
        </DialogContent>
      </Dialog>
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="border-1 border-neutral-700 shadow-none">
          <DialogHeader>
            <DialogTitle>{t('export')}</DialogTitle>
          </DialogHeader>
          <Export />
        </DialogContent>
      </Dialog>
      <Dialog open={isAboutUsDialogOpen} onOpenChange={setIsAboutUsDialogOpen}>
        <DialogContent className="border-1 border-neutral-700 shadow-none">
          <DialogHeader>
            <DialogTitle>{t('aboutUsDialog.title')}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="p-4">
            <span className="text-md" dangerouslySetInnerHTML={{ __html: t('aboutUsDialog.content', { interpolation: { escapeValue: false } }) }} />

            <span className="text-md">
              <br />
              <br />
              {t('support')}
            </span>

            <span className="flex mt-6 justify-center gap-4">
              <GitHubButton
                href="https://github.com/marcelpanse/tcg-pocket-collection-tracker"
                data-color-scheme="no-preference: light; light: light; dark: light;"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="true"
                aria-label="Star marcelpanse/tcg-pocket-collection-tracker on GitHub"
              >
                Star
              </GitHubButton>

              <GitHubButton
                href="https://github.com/marcelpanse/tcg-pocket-collection-tracker/issues"
                data-color-scheme="no-preference: light; light: light; dark: light;"
                data-size="large"
                data-show-count="true"
                aria-label="Issue marcelpanse/tcg-pocket-collection-tracker on GitHub"
              >
                Issue
              </GitHubButton>

              <GitHubButton
                href="https://github.com/marcelpanse/tcg-pocket-collection-tracker"
                data-color-scheme="no-preference: light; light: light; dark: light;"
                data-size="large"
                aria-label="Code marcelpanse/tcg-pocket-collection-tracker on GitHub"
              >
                Read me
              </GitHubButton>
            </span>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}
