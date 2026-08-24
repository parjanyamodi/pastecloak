import { getPaste, verifyPassword } from "@/lib/actions";
import NavBar from "@/app/components/navbar/NavBar";
import PasteView from "./PasteView";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PastePage({ params }: Props) {
  const { id } = await params;
  const result = await getPaste(id);

  if ("error" in result && !result.passwordProtected) {
    notFound();
  }

  return (
    <main className="min-h-screen relative">
      <div className="gradient-bg" />
      <div className="noise" />
      <div className="relative z-10">
        <NavBar />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <PasteView
            urlId={id}
            initialData={result}
            verifyPassword={verifyPassword}
          />
        </div>
      </div>
    </main>
  );
}
