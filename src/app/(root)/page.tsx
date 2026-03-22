import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";
import InputPanel from "./_components/InputPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1321] to-[#0A0F1D]">
      <div className="max-w-450 mx-auto p-4">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <EditorPanel />
            <InputPanel />
          </div>
          <OutputPanel />
        </div>
      </div>
    </div>
  );
}

