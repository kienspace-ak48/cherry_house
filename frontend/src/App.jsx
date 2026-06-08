import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import BookingPage from './pages/booking/BookingPage';
import RoomDetailPage from './pages/RoomDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import CheckoutResultPage from './pages/checkout/CheckoutResultPage';
import ProfilePage from './pages/ProfilePage';
import PropertyListingPage from './pages/properties/PropertyListingPage';
import PropertyDetailPage from './pages/properties/PropertyDetailPage';

import BranchDetailPage from './pages/properties/BranchDetailPage';
import PropertyBranchSelectPage from './pages/properties/PropertyBranchSelectPage';
import RegisterPage from './pages/auth/RegisterPage';
import RegisterEmailPage from './pages/auth/RegisterEmailPage';
import LoginPage from './pages/auth/LoginPage';
import AuthCallbackPage from './pages/auth/AuthCallbackPage';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<HomePage />}></Route>
          <Route path="register" element={<RegisterPage />} />
          <Route path="register/email" element={<RegisterEmailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="oauth/callback" element={<AuthCallbackPage />} />
          <Route path="properties" element={<PropertyListingPage />} />
          <Route path="properties/:propertySlug/branches" element={<PropertyBranchSelectPage />} />
          <Route path="properties/:propertySlug/branches/:branchId" element={<BranchDetailPage />} />
          <Route path="properties/:slug" element={<PropertyDetailPage />} />
          <Route path="rooms" element={<RoomPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="room/:slug" element={<RoomDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="checkout/result" element={<CheckoutResultPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
