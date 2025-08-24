// @ts-ignore
import GhostContentAPI from '@tryghost/content-api'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import useWindowDimensions from '@/lib/hooks/useWindowDimensionsHook.ts'

interface Post {
  id?: string
  feature_image: string
  title: string
  published_at: string
  url: string
  excerpt: string
}

const api = new GhostContentAPI({
  url: 'https://blog.tcgpocketcollectiontracker.com',
  key: import.meta.env.VITE_GHOST_API_KEY,
  version: 'v6.0',
})

export const BlogOverview = () => {
  const { width } = useWindowDimensions()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const posts = (await api.posts.browse({ limit: width >= 1024 ? 3 : 2 })) as Post[]
        setPosts(posts)
      } finally {
        setLoading(false)
      }
    })()
  }, [width])

  if (loading) {
    return null
  }

  return (
    <section className="w-full flex mx-auto max-w-7xl px-8 pt-10">
      <div className="w-full grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const date = new Date(post.published_at)
          const formatted = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })

          return (
            <Card key={post.url ?? post.title} className="overflow-hidden flex flex-col border-1 border-neutral-700 rounded-md bg-neutral-800 text-neutral-400">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg leading-snug">
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {post.title}
                  </a>
                </CardTitle>
                <CardDescription className="text-xs">{formatted}</CardDescription>
              </CardHeader>

              <CardContent className="text-sm text-muted-foreground">{post.excerpt}</CardContent>

              <CardFooter className="mt-auto">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Read post →
                </a>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
