import BlueprintWizard from '@/components/BlueprintWizard'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <header className="mx-auto mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-800">
          Cynbit project blueprint
        </p>
        <h1 className="mt-2 text-4xl font-bold">Scope your project in two minutes</h1>
        <p className="mt-3 text-slate-600">
          Answer four short steps and get an indicative timeline and team. We send the same brief
          to Cynbit, so the first call starts from your scope instead of a blank page.
        </p>
      </header>
      <BlueprintWizard />
    </main>
  )
}
