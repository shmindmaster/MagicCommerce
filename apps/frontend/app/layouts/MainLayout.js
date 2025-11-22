'use client'

import TopMenu from './includes/TopMenu'
import MainHeader from './includes/MainHeader'
import SubMenu from './includes/SubMenu'
import Footer from './includes/Footer'
import Loading from '../components/Loading'
import HealthStatusBadge from '../components/HealthStatusBadge'
import { useEffect, useState } from 'react'

export default function MainLayout({ children }) {
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() =>{
      window.addEventListener("storage", function () {
        let res = localStorage.getItem('isLoading')
        res === 'false' ? setIsLoading(false) : setIsLoading(true)
      })
    })

    return (
      <>
        <div id="MainLayout" className='min-w-[1050px] max-w-[1300px] mx-auto' suppressHydrationWarning={true}>
            <div>
              {isLoading ? <Loading /> : <div></div>}
              <TopMenu />
              <MainHeader />
              <SubMenu />
              <HealthStatusBadge />
            </div>

            <div>{children}</div>

            <div>
              <Footer />
            </div>
        </div>
      </>
    )
  }