import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-bold text-primary">
            Pardical<span className="font-normal text-slate-500"> Solutions</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </div>

        <a
          href="#contact"
          className="bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Get a Demo
        </a>
      </div>
    </nav>
  );
}
