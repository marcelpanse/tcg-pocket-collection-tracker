import Giscus from '@giscus/react'

interface Props {
  term: string
}

export function Board({ term }: Props) {
  return (
    <Giscus
      id="comments"
      term={term}
      repo="marcelpanse/tcg-pocket-collection-tracker"
      repoId="925409235"
      categoryId="DIC_kwDONyif084CmzGj"
      mapping="specific"
      reactionsEnabled="0"
      emitMetadata="0"
      inputPosition="bottom"
      theme="light"
      lang="en"
      loading="lazy"
    />
  )
}
