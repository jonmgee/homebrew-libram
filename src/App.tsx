import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import SubCategoryPage from "./components/SubCategoryPage";
import BrowsePage from "./components/BrowsePage";
import CreateEntryPage from "./components/CreateEntryPage";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-dvh bg-zinc-950 text-zinc-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse/:category" element={<SubCategoryPage />} />
          <Route path="/browse/:category/:subcategory" element={<BrowsePage />} />
          <Route path="/create" element={<CreateEntryPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;