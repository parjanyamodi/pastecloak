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
    <main className="relative flex min-h-screen flex-col items-center pt-20 p-4 z-10">
      <NavBar />
      <PasteView
        urlId={id}
        initialData={result}
        verifyPassword={verifyPassword}
      />
    </main>
  );
}
