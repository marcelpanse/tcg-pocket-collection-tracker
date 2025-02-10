export function NoTradeableCards() {
  return (
    <article className="mx-auto grid max-w-7xl gap-5">
      <section className="mx-auto h-full w-full max-w-screen-xl rounded-4xl border-2 border-gray-500 p-10 text-center lg:px-6 lg:py-16">
        <div className="mx-auto max-w-screen-md sm:text-center">
          <h2 className="mb-4 font-extrabold text-3xl tracking-tight sm:text-4xl">You have no tradeable cards!</h2>
          <p className="mx-auto mb-4 max-w-2xl sm:text-xl">Go to the collections page and input your collected cards to see what you can trade</p>
        </div>
      </section>
    </article>
  )
}
