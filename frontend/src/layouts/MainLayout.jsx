import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'
import { SeoProvider } from '../seo/SeoContext'
import PageSeo from '../seo/PageSeo'
import ChatBotWidget from '../components/chat/ChatBotWidget'
import PromoPopupModal from '../components/promo/PromoPopupModal'
import ScrollToTop from '../components/ScrollToTop'
import RouteTransitionLoading from '../components/RouteTransitionLoading'

function MainLayout() {
  return (
    <SeoProvider>
      <ScrollToTop />
      <RouteTransitionLoading />
      <PageSeo />
      <div className="flex min-h-screen flex-col bg-surface">
          <Header />
          <main className="flex-1 pt-[4.25rem] md:pt-[4.75rem]">
              <Outlet />
          </main>
          <Footer/>
          <PromoPopupModal />
          <ChatBotWidget />
      </div>
    </SeoProvider>
  )
}

export default MainLayout