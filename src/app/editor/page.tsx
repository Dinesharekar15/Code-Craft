import EditorPanel from "../(root)/_components/EditorPanel";
import Header from "../(root)/_components/Header";
import OutputPanel from "../(root)/_components/OutputPanel";
import InputPanel from "../(root)/_components/InputPanel";

export default function EditorPage() {
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
