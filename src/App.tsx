import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import SubCategoryPage from "./components/SubCategoryPage";
import BrowsePage from "./components/BrowsePage";
import CreateEntryPage from "./components/CreateEntryPage";
import CreateEntryInputPage from "./components/CreateEntryInputPage";
import EntryDetailPage from "./components/EntryDetailPage";
import EditEntryPage from "./components/EditEntryPage";
import LoginPage from "./components/LoginPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import SharedEntryPage from "./components/SharedEntryPage";
import SharedLibramPage from "./components/SharedLibramPage";
import ShareSettingsPage from "./components/ShareSettingsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <NavBar />
        <main className="book-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            {/* Public share pages — no auth required */}
            <Route path="/share/libram/:token" element={<SharedLibramPage />} />
            <Route path="/share/:token" element={<SharedEntryPage />} />
            <Route
              path="/share-libram"
              element={
                <AuthGuard>
                  <ShareSettingsPage />
                </AuthGuard>
              }
            />
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
          <Footer />
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;