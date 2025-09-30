import { LogOut, Menu, UserRoundPen } from 'lucide-react'
import type * as React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useProfileDialog } from '@/services/account/useAccount'
import { useLoginDialog, useLogout, useUser } from '@/services/auth/useAuth'
import { useActionableTradeCount } from '@/services/trade/useTrade.ts'

type MenuItem = {
  title: string
  href: string
}

const menuItems: MenuItem[] = [
  { title: 'overview', href: '/' },
  { title: 'collection', href: '/collection' },
  { title: 'decks', href: '/decks' },
  { title: 'trade', href: '/trade' },
  { title: 'scan', href: '/scan' },
  { title: 'blog', href: 'https://blog.tcgpocketcollectiontracker.com' },
  { title: 'community', href: 'https://community.tcgpocketcollectiontracker.com' },
]

export default function HamburgerMenu() {
  const { t } = useTranslation('header')

  const { setIsProfileDialogOpen } = useProfileDialog()
  const { setIsLoginDialogOpen } = useLoginDialog()
  const { data: user } = useUser()
  const logoutMutation = useLogout()
  const { data: actionableTradeCount = 0 } = useActionableTradeCount()

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
            <MenuItemComponent key={item.title} item={item} setOpen={setOpen} actionableTradeCount={actionableTradeCount} />
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

const MenuItemComponent: React.FC<{ actionableTradeCount: number; item: MenuItem; setOpen: (open: boolean) => void }> = ({
  actionableTradeCount,
  item,
  setOpen,
}) => {
  const { t } = useTranslation('header')

  return (
    <Link
      to={item.href}
      className={cn('block py-2 text-lg font-medium transition-colors hover:text-primary', item.href === '/' && 'text-primary')}
      onClick={() => {
        setOpen(false)
      }}
    >
      <div className="flex items-center gap-2">
        {t(item.title)}
        {item.title === 'trade' && actionableTradeCount > 0 && (
          <Badge
            className={`h-5 min-w-5 rounded-full font-mono tabular-nums -mt-2 ${actionableTradeCount ? 'flex' : 'hidden'} justify-center`}
            variant="destructive"
          >
            {actionableTradeCount}
          </Badge>
        )}
      </div>
    </Link>
  )
}
