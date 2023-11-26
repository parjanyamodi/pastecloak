import NavBar from "@/app/components/navbar/NavBar";
import ContentBox from "./components/create-content/ContentBox";

export default function Home() {
  return (
    <main className="flex h-screen  flex-col items-center">
      <NavBar />
      <ContentBox />
    </main>
  );
}
