import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manifest.report",
	description: "Find the changes you're looking for.",
	openGraph: {
		title: "Manifest.report",
		description: "Find the changes you're looking for.",
		url: "https://site.manifest.report/",
	}
};

export default function Home() {
  return (
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">manifest.report is a work-in-progress project that aims to help you
          find the changes you&apos;re looking for.</div>
        <div className="flex gap-4 items-center flex-col sm:flex-row">We&apos;re currently in the process of
        building out the features and functionality of the site, so please check
          back soon for updates.</div>
        <Link href="/manifests" className="text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4">Check the manifest list</Link>
      </main>
  );
}
