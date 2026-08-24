import NavBar from "@/app/components/navbar/NavBar";
import ContentBox from "./components/create-content/ContentBox";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="gradient-bg" />
      <div className="noise" />
      <div className="relative z-10">
        <NavBar />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <ContentBox />
        </div>
      </div>
    </main>
  );
}
