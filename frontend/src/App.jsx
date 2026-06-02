import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';
import BookingPage from './pages/booking/BookingPage';
import RoomDetailPage from './pages/RoomDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import PropertyListingPage from './pages/properties/PropertyListingPage';
import PropertyDetailPage from './pages/properties/PropertyDetailPage';

import BranchDetailPage from './pages/properties/BranchDetailPage';
import PropertyBranchSelectPage from './pages/properties/PropertyBranchSelectPage';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainLayout />}>
          <Route index element={<HomePage />}></Route>
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
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
