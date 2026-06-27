import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./components/HomePage";
import SubCategoryPage from "./components/SubCategoryPage";
import BrowsePage from "./components/BrowsePage";
import CreateEntryPage from "./components/CreateEntryPage";
import CreateEntryInputPage from "./components/CreateEntryInputPage";
import EntryDetailPage from "./components/EntryDetailPage";

function App() {
  // Safari intercepts drag-and-drop at the window level. We only need to
  // intercept the drop event to prevent Safari navigating to the image.
  // We do NOT intercept dragover at window — calling preventDefault there
  // marks window as the drop target, preventing child elements from
  // receiving onDrop.
  useEffect(() => {
    const prevent = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener("drop", prevent);
    return () => {
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