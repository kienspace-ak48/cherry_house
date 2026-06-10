import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'
import { SeoProvider } from '../seo/SeoContext'
import PageSeo from '../seo/PageSeo'
import ChatBotWidget from '../components/chat/ChatBotWidget'
import ScrollToTop from '../components/ScrollToTop'

function MainLayout() {
  return (
    <SeoProvider>
      <ScrollToTop />
      <PageSeo />
      <div className="flex min-h-screen flex-col bg-surface">
          <Header />
          <main className="flex-1 pt-[4.25rem] md:pt-[4.75rem]">
              <Outlet />
          </main>
          <Footer/>
          <ChatBotWidget />
      </div>
    </SeoProvider>
  )
}

export default MainLayout