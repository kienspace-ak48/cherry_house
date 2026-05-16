import Header from '../components/Header'
import Footer from '../components/Footer'
import { Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
        <Header />
        <main className="flex-1 pt-[4.25rem] md:pt-[4.75rem]">
            <Outlet />
        </main>
        <Footer/>
    </div>
  )
}

export default MainLayout