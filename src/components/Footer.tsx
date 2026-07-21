const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer mt-16 px-4 pb-10 pt-8 text-[var(--sea-ink-soft)]">
      <div className="page-wrap text-center sm:text-left">
        <p className="m-0 text-sm">&copy; {year} Pre-Loved. All rights reserved.</p>
        <p className="mt-2 text-xs">
          Reserve or waitlist items and the owner will contact you to arrange pickup.
        </p>
      </div>
    </footer>
  )
}

export default Footer
