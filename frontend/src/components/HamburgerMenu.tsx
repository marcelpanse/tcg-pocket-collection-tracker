import { LogOut, Menu, UserRoundPen } from 'lucide-react'
import type * as React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useProfileDialog } from '@/services/account/useAccount'
import { useLoginDialog, useLogout, useUser } from '@/services/auth/useAuth'

type MenuItem = {
  title: string
  href: string
}

const menuItems: MenuItem[] = [
  { title: 'overview', href: '/' },
  { title: 'collection', href: '/collection' },
  { title: 'decks', href: '/decks' },
  { title: 'trade', href: '/trade' },
  { title: 'blog', href: 'https://blog.tcgpocketcollectiontracker.com' },
  { title: 'community', href: 'https://community.tcgpocketcollectiontracker.com' },
]

export default function HamburgerMenu() {
  const { t } = useTranslation('hamburger-menu')

  const { setIsProfileDialogOpen } = useProfileDialog()
  const { setIsLoginDialogOpen } = useLoginDialog()
  const { data: user } = useUser()
  const logoutMutation = useLogout()

  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
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
              logoutMutation.mutate()
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
