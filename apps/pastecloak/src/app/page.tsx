import NavBar from "@/app/components/navbar/NavBar";
import ContentBox from "./components/create-content/ContentBox";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Background Effects */}
      <div className="mesh-bg" />
      <div className="grid-pattern" />
      
      {/* Content */}
      <div className="relative z-10">
        <NavBar />
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <ContentBox />
        </div>
      </div>
    </main>
  );
}
