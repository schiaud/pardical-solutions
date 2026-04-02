export function CTA() {
  return (
    <section id="contact" className="py-20 px-6 bg-primary-dark">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white">
          Ready to 2-3x Your Team&apos;s Output?
        </h2>
        <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
          Schedule a 20-minute demo. We&apos;ll show you exactly how the platform works
          with your parts, your suppliers, and your workflow.
        </p>

        <div className="mt-10 max-w-lg mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <form
            action="https://formspree.io/f/placeholder"
            method="POST"
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="text"
                name="company"
                placeholder="Company name"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <select
              name="team_size"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/70 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">How many employees?</option>
              <option value="1-3">1-3</option>
              <option value="4-8">4-8</option>
              <option value="9-15">9-15</option>
              <option value="15+">15+</option>
            </select>
            <button
              type="submit"
              className="w-full bg-accent hover:bg-accent-light text-primary-dark font-bold py-4 rounded-xl transition-colors text-lg"
            >
              Schedule My Demo
            </button>
          </form>
          <p className="mt-4 text-white/50 text-xs">
            No obligation. No credit card required. We&apos;ll reach out within 24 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
