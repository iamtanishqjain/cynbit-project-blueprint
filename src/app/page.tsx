import Image from 'next/image'
import BlueprintWizard from '@/components/BlueprintWizard'

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="border-b border-outline-variant/60 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Image src="/cynbit-logo.svg" alt="Cynbit" width={100} height={41} unoptimized priority />
          <span className="rounded-full bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-widest text-white">
            Contact
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <section className="mb-10 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-widest text-primary">Inquiry hub</p>
          <h1 className="mt-3 font-headline text-4xl font-extrabold leading-tight sm:text-5xl">
            Start your next project <span className="text-primary">with us.</span>
          </h1>
          <p className="mt-4 text-lg text-on-surface-variant">
            Answer four short steps and get an indicative timeline and team. We send the same brief
            to Cynbit, so the first call starts from your scope instead of a blank page.
          </p>
        </section>

        <section className="rounded-[2.5rem] bg-white p-6 shadow-sm sm:p-10">
          <BlueprintWizard />
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-on-surface-variant">
        Prototype for the Cynbit Full Stack Developer Intern task. On the live site this replaces
        the free-text box on the contact page.
      </footer>
    </div>
  )
}
