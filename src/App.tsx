import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Classes } from './pages/Classes'
import { Contact } from './pages/Contact'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { NotFound } from './pages/NotFound'
import { Pricing } from './pages/Pricing'
import { Register } from './pages/Register'
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard'
import { Members as AdminMembers } from './pages/admin/Members'
import { Trainers as AdminTrainers } from './pages/admin/Trainers'
import { Plans as AdminPlans } from './pages/admin/Plans'
import { Classes as AdminClasses } from './pages/admin/Classes'
import { Payments as AdminPayments } from './pages/admin/Payments'
import { AttendanceHistory as MemberAttendance } from './pages/member/Attendance'
import { Classes as MemberClasses } from './pages/member/Classes'
import { Dashboard as MemberDashboard } from './pages/member/Dashboard'
import { Profile as MemberProfile } from './pages/member/Profile'
import { Subscription as MemberSubscription } from './pages/member/Subscription'
import { Dashboard as TrainerDashboard } from './pages/trainer/Dashboard'

/**
 * Application routes.
 *
 * Public pages render inside the shared AppLayout (navbar + footer).
 * Role areas mount behind <ProtectedRoute>, which restores the persisted
 * session first, redirects guests to /login and wrong-role users home.
 */
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public */}
        <Route index element={<Home />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Member area */}
        <Route path="/member" element={<ProtectedRoute roles={['member']} />}>
          <Route index element={<MemberDashboard />} />
          <Route path="classes" element={<MemberClasses />} />
          <Route path="subscription" element={<MemberSubscription />} />
          <Route path="attendance" element={<MemberAttendance />} />
          <Route path="profile" element={<MemberProfile />} />
        </Route>

        {/* Trainer area */}
        <Route path="/trainer" element={<ProtectedRoute roles={['trainer']} />}>
          <Route index element={<TrainerDashboard />} />
        </Route>

        {/* Admin area */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="trainers" element={<AdminTrainers />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="payments" element={<AdminPayments />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App