export default function Header() {
  return (
    <header className="border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-primary/80">Set-Piece IQ</p>
          <h1 className="text-2xl font-semibold text-white">Advanced Set-Piece Intelligence</h1>
        </div>
        <div className="hidden text-sm text-gray-400 md:block">
          Deep analytics for corners &amp; free kicks
        </div>
      </div>
    </header>
  );
}
