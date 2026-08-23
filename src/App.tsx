import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthGuard from "./components/AuthGuard";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import LandingPage from "./components/LandingPage";
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
import AccountPage from "./components/AccountPage";

/**
 * "/" is the public front door. Signed out it shows the landing page —
 * previously it redirected straight to a bare sign-in card, so nobody could
 * see what the app did before making an account. Signed in it's the library
 * home, still behind AuthGuard so the oath and install prompts are unchanged.
 */
function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
        <p className="phb-description text-sm text-[#766649]">Loading…</p>
      </div>
    );
  }

  if (!user) return <LandingPage />;

  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}

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
              path="/account"
              element={
                <AuthGuard>
                  <AccountPage />
                </AuthGuard>
              }
            />
            <Route path="/" element={<RootRoute />} />
            <Route
              path="/browse/all"
              element={
                <AuthGuard>
                  <BrowsePage />
                </AuthGuard>
              }
            />
            {/* Must precede /browse/:category, which renders the tile picker */}
            <Route
              path="/browse/bookmarks"
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