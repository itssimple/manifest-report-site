
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">manifest.report is a work-in-progress project that aims to help you
          find the changes you&apos;re looking for.</div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">We&apos;re currently in the process of
        building out the features and functionality of the site, so please check
        back soon for updates.</div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        A footer will be here soon
      </footer>
    </div>
  );
}
