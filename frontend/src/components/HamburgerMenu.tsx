import { LogOut, Menu, UserRoundPen } from 'lucide-react'
import type * as React from 'react'
import { use, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { logout } from '@/lib/Auth.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { cn } from '@/lib/utils'

type MenuItem = {
  title: string
  href: string
}

const menuItems: MenuItem[] = [
  { title: 'overview', href: '/' },
  { title: 'collection', href: '/collection' },
  { title: 'trade', href: '/trade' },
  { title: 'community', href: 'https://community.tcgpocketcollectiontracker.com' },
]

const MenuItemComponent: React.FC<{ item: MenuItem; setOpen: (open: boolean) => void }> = ({ item, setOpen }) => {
  const { t } = useTranslation('hamburger-menu')

  return (
    <Link
      to={item.href}
      className={cn('block py-2 text-lg font-medium transition-colors hover:text-primary', item.href === '/' && 'text-primary')}
      onClick={() => {
        setOpen(false)
      }}
    >
      {t(item.title)}
    </Link>
  )
}

export default function HamburgerMenu() {
  const { t } = useTranslation('hamburger-menu')

  const [open, setOpen] = useState(false)
  const { user, setUser, setIsLoginDialogOpen, setIsProfileDialogOpen } = use(UserContext)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t('toggle')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-[240px] sm:w-[300px]">
        <nav className="flex flex-col space-y-4 grow-1">
          {menuItems.map((item) => (
            <MenuItemComponent key={item.title} item={item} setOpen={setOpen} />
          ))}
        </nav>

        <Button
          variant="secondary"
          onClick={() => {
            setIsProfileDialogOpen(true)
            setOpen(false)
          }}
        >
          {t('editProfile')}
          <UserRoundPen />
        </Button>

        {user ? (
          <Button
            variant="default"
            onClick={async () => {
              await logout()
              setUser(null)
              setOpen(false)
            }}
          >
            {t('logOut')}
            <LogOut />
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={() => {
              setIsLoginDialogOpen(true)
              setOpen(false)
            }}
          >
            {t('login')}
          </Button>
        )}
      </SheetContent>
    </Sheet>
  )
}
