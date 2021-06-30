import Link from '@/components/Link'

export default function Pagination({ totalPages, currentPage }) {
  const prevPage = parseInt(currentPage) - 1 > 0
  const nextPage = parseInt(currentPage) + 1 <= parseInt(totalPages)

  return (
    <div className="pt-6 pb-8 space-y-2 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button rel="previous" className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Precedente
          </button>
        )}
        {prevPage && (
          <Link href={currentPage - 1 === 1 ? `/post/` : `/post/page/${currentPage - 1}`}>
            <button rel="previous">Precedente</button>
          </Link>
        )}
        <span>
          {currentPage} di {totalPages}
        </span>
        {!nextPage && (
          <button rel="next" className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Successivo
          </button>
        )}
        {nextPage && (
          <Link href={`/post/page/${currentPage + 1}`}>
            <button rel="next">Successivo</button>
          </Link>
        )}
      </nav>
    </div>
  )
}
