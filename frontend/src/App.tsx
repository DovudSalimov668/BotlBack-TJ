import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import { CursorGlow } from '@/components/CursorGlow'
import { Toaster } from '@/components/Toast'
import { SplashScreen } from '@/components/SplashScreen'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { RequireAuth } from '@/components/RequireAuth'
import '@/lib/i18n'
import 'leaflet/dist/leaflet.css'

const ConsumerLayout = lazy(() => import('@/pages/ConsumerLayout'))
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ScanPage = lazy(() => import('@/pages/ScanPage'))
const ScanResultPage = lazy(() => import('@/pages/ScanResultPage'))
const WalletPage = lazy(() => import('@/pages/WalletPage'))
const RewardsPage = lazy(() => import('@/pages/RewardsPage'))
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'))
const MapPage = lazy(() => import('@/pages/MapPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'))
const ImpactPage = lazy(() => import('@/pages/ImpactPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const GeographicPage = lazy(() => import('@/pages/admin/GeographicPage'))
const TimeSeriesPage = lazy(() => import('@/pages/admin/TimeSeriesPage'))
const CampaignsPage = lazy(() => import('@/pages/admin/CampaignsPage'))
const OutletsPage = lazy(() => import('@/pages/admin/OutletsPage'))
const QRCodesPage = lazy(() => import('@/pages/admin/QRCodesPage'))
const ScorecardPage = lazy(() => import('@/pages/admin/ScorecardPage'))
const AdminPrizesPage = lazy(() => import('@/pages/admin/AdminPrizesPage'))
const AdminRedemptionsPage = lazy(() => import('@/pages/admin/AdminRedemptionsPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CursorGlow />
        <Toaster />
        <SplashScreen />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public auth page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Consumer shell — public pages available to all */}
            <Route element={<ConsumerLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              <Route path="map" element={<MapPage />} />

              {/* Protected pages — redirect to /login if not authenticated */}
              <Route element={<RequireAuth />}>
                <Route path="scan" element={<ScanPage />} />
                <Route path="scan/result/:id" element={<ScanResultPage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="rewards" element={<RewardsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="impact" element={<ImpactPage />} />
              </Route>
            </Route>

            {/* Admin dashboard — AdminLayout checks is_staff itself */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="geographic" element={<GeographicPage />} />
              <Route path="timeseries" element={<TimeSeriesPage />} />
              <Route path="campaigns" element={<CampaignsPage />} />
              <Route path="outlets" element={<OutletsPage />} />
              <Route path="qrcodes" element={<QRCodesPage />} />
              <Route path="scorecard" element={<ScorecardPage />} />
              <Route path="prizes" element={<AdminPrizesPage />} />
              <Route path="redemptions" element={<AdminRedemptionsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </BrowserRouter>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}
