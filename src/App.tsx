import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import SubCategoryPage from "./components/SubCategoryPage";
import BrowsePage from "./components/BrowsePage";
import CreateEntryPage from "./components/CreateEntryPage";
import CreateEntryInputPage from "./components/CreateEntryInputPage";
import EntryDetailPage from "./components/EntryDetailPage";

function App() {
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