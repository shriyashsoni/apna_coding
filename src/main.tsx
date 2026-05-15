import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { PrivyProvider } from '@privy-io/react-auth';
import { HelmetProvider } from 'react-helmet-async';
import { ScrollToTop } from '@/components/ScrollToTop';
import "./index.css";
import "./types/global.d.ts";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const EventDetail = lazy(() => import("./pages/EventDetail.tsx"));
const EventGroups = lazy(() => import("./pages/EventGroups.tsx"));
const EventGroupDetail = lazy(() => import("./pages/EventGroupDetail.tsx"));
const Hackathons = lazy(() => import("./pages/Hackathons.tsx"));
const HackathonDetail = lazy(() => import("./pages/HackathonDetail.tsx"));
const Jobs = lazy(() => import("./pages/Jobs.tsx"));
const JobDetail = lazy(() => import("./pages/JobDetail.tsx"));
const Products = lazy(() => import("./pages/Products.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const News = lazy(() => import("./pages/News.tsx"));
const NewsDetail = lazy(() => import("./pages/NewsDetail.tsx"));
const Partnerships = lazy(() => import("./pages/Partnerships.tsx"));
const BrandingKit = lazy(() => import("./pages/BrandingKit.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const MyContent = lazy(() => import("./pages/MyContent.tsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.tsx"));
const Certificates = lazy(() => import("./pages/Certificates.tsx"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate.tsx"));
const IssueCertificate = lazy(() => import("./pages/IssueCertificate.tsx"));
const AdminCertificates = lazy(() => import("./pages/AdminCertificates.tsx"));
const Communities = lazy(() => import("./pages/Communities.tsx"));
const CommunityPage = lazy(() => import("./pages/CommunityPage.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Services = lazy(() => import("./pages/Services.tsx"));
const LaunchOnChain = lazy(() => import("./pages/LaunchOnChain.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <InstrumentationProvider>
        <PrivyProvider
          appId={import.meta.env.VITE_PRIVY_APP_ID || "cmp4fqtka00ul0bl44tgj35vz"}
          config={{
            appearance: {
              theme: 'dark',
              accentColor: '#00ffff',
              logo: 'https://harmless-tapir-303.convex.cloud/api/storage/1afb27dd-9d64-48c2-be2e-ada93b76526a',
            },
            embeddedWallets: {
              ethereum: {
                createOnLogin: 'users-without-wallets',
              }
            },
          }}
        >
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<RouteLoading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:slug" element={<EventDetail />} />
                <Route path="/event-groups" element={<EventGroups />} />
                <Route path="/event-groups/:slug" element={<EventGroupDetail />} />
                <Route path="/hackathons" element={<Hackathons />} />
                <Route path="/hackathons/:slug" element={<HackathonDetail />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:slug" element={<JobDetail />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:slug" element={<NewsDetail />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/branding" element={<BrandingKit />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-content" element={<MyContent />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/certificates" element={<AdminCertificates />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/issue-certificate" element={<IssueCertificate />} />
                <Route path="/verify/:certificateNumber?" element={<VerifyCertificate />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/community/:slug" element={<CommunityPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/launch-onchain" element={<LaunchOnChain />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
          </BrowserRouter>
        </PrivyProvider>
      </InstrumentationProvider>
    </HelmetProvider>
  </StrictMode>
);
