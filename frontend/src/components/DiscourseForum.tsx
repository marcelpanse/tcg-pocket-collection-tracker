import { type FC, useEffect } from 'react'

declare global {
  interface Window {
    DiscourseEmbed: {
      discourseUrl: string
      topicId: string
    }
  }
}

type Props = {
  topicId: string
}

export const DiscourseForum: FC<Props> = ({ topicId }) => {
  useEffect(() => {
    window.DiscourseEmbed = {
      discourseUrl: 'https://community.tcgpocketcollectiontracker.com/',
      topicId,
    }

    console.log('adding script')
    const d = document.createElement('script')
    d.type = 'text/javascript'
    d.async = true
    d.src = `${window.DiscourseEmbed.discourseUrl}javascripts/embed.js`
    ;(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d)
  }, [])

  return <div id="discourse-comments" />
}
