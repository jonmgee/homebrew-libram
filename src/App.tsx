import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "./components/HomePage";
import SubCategoryPage from "./components/SubCategoryPage";
import BrowsePage from "./components/BrowsePage";
import CreateEntryPage from "./components/CreateEntryPage";
import CreateEntryInputPage from "./components/CreateEntryInputPage";
import EntryDetailPage from "./components/EntryDetailPage";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        className="book-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse/all" element={<BrowsePage />} />
          <Route path="/browse/:category" element={<SubCategoryPage />} />
          <Route path="/browse/:category/:subcategory" element={<BrowsePage />} />
          <Route path="/create" element={<CreateEntryPage />} />
          <Route path="/create/:type" element={<CreateEntryInputPage />} />
          <Route path="/entry/:id" element={<EntryDetailPage />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;