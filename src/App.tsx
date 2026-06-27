import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./components/HomePage";
import SubCategoryPage from "./components/SubCategoryPage";
import BrowsePage from "./components/BrowsePage";
import CreateEntryPage from "./components/CreateEntryPage";
import CreateEntryInputPage from "./components/CreateEntryInputPage";
import EntryDetailPage from "./components/EntryDetailPage";

function App() {
  // Safari intercepts drag-and-drop at the window level before document-level
  // handlers can fire. Intercepting at window with stopPropagation prevents
  // Safari from navigating to the dragged image.
  useEffect(() => {
    const prevent = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  return (
    <BrowserRouter>
      <main className="book-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse/all" element={<BrowsePage />} />
          <Route path="/browse/:category" element={<SubCategoryPage />} />
          <Route path="/browse/:category/:subcategory" element={<BrowsePage />} />
          <Route path="/create" element={<CreateEntryPage />} />
          <Route path="/create/:type" element={<CreateEntryInputPage />} />
          <Route path="/entry/:id" element={<EntryDetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;