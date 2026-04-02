export function Footer() {
  return (
    <footer className="py-12 px-6 bg-primary-dark border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-lg font-bold text-white">
              Pardical<span className="font-normal text-white/60"> Solutions</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/eula" className="hover:text-white transition-colors">EULA</a>
          </div>

          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} Pardical Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
