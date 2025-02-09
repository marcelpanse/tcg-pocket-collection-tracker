import { Button } from '@/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx'
import { ExternalLink } from 'lucide-react'
import { Board } from './components/Board'

function Community() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-y-4">
      <h1 className="text-3xl font-bold">Community </h1>
      <Tabs defaultValue="introduce">
        <TabsList className="m-auto mt-4 mb-8">
          <TabsTrigger value="introduce">Introduce yourself</TabsTrigger>
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="feedback">Ideas & Feedback</TabsTrigger>
          <Button variant={'ghost'} size="sm" onClick={() => window.open('https://github.com/marcelpanse/tcg-pocket-collection-tracker', '_blank')}>
            GitHub repository <ExternalLink />
          </Button>
        </TabsList>
        <TabsContent value="introduce">
          <h1 className="text-lg">Say hello! 👋</h1>
          <p className="text-sm mb-20">
            Let's connect and get to know each other. We're a community of people who love to play TCG. We're here to help each other, share our knowledge, and
            learn from each other. Whether you're a seasoned player or just starting out, we welcome you to join us.
          </p>
          <Board term="app/introductions" />
        </TabsContent>
        <TabsContent value="trade">
          <h1 className="text-lg">Trading 💰</h1>
          <p className="text-sm mb-20">Trade! Leave your wishlist of cards so others can comment and connect with youto set up trades.</p>
          <Board term="app/trade" />
        </TabsContent>
        <TabsContent value="feedback">
          <h1 className="text-lg">Ideas & Feedback 💡</h1>
          <p className="text-sm mb-20">
            This website is a fully open source work in progress. We're always looking for ways to improve the experience. If you have any ideas or feedback,
            please let us know!
          </p>
          <Board term="app/feedback" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Community
