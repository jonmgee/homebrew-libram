import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import SubCategoryPage from "./components/SubCategoryPage";
import BrowsePage from "./components/BrowsePage";
import CreateEntryPage from "./components/CreateEntryPage";
import CreateEntryInputPage from "./components/CreateEntryInputPage";
import EntryDetailPage from "./components/EntryDetailPage";
import EditEntryPage from "./components/EditEntryPage";
import LoginPage from "./components/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <NavBar />
        <main className="book-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <AuthGuard>
                  <HomePage />
                </AuthGuard>
              }
            />
            <Route
              path="/browse/all"
              element={
                <AuthGuard>
                  <BrowsePage />
                </AuthGuard>
              }
            />
            <Route
              path="/browse/:category"
              element={
                <AuthGuard>
                  <SubCategoryPage />
                </AuthGuard>
              }
            />
            <Route
              path="/browse/:category/:subcategory"
              element={
                <AuthGuard>
                  <BrowsePage />
                </AuthGuard>
              }
            />
            <Route
              path="/create"
              element={
                <AuthGuard>
                  <CreateEntryPage />
                </AuthGuard>
              }
            />
            <Route
              path="/create/:type"
              element={
                <AuthGuard>
                  <CreateEntryInputPage />
                </AuthGuard>
              }
            />
            <Route
              path="/entry/:id"
              element={
                <AuthGuard>
                  <EntryDetailPage />
                </AuthGuard>
              }
            />
            <Route
              path="/entry/:id/edit"
              element={
                <AuthGuard>
                  <EditEntryPage />
                </AuthGuard>
              }
            />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;