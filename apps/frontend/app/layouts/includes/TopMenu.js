'use client'

import Link from "next/link";
import { BsChevronDown } from 'react-icons/bs'
import { AiOutlineShoppingCart } from 'react-icons/ai'
import { useUser } from "../../context/user"
import { useEffect, useState, useRef } from "react";
import { useCart } from "../../context/cart"
import { useRouter } from "next/navigation"
import ClientOnly from "../../components/ClientOnly"
import 'flag-icons/css/flag-icons.min.css'

export default function TopMenu() {
    const router = useRouter()
    const user = useUser();
    const cart = useCart();
    const [isMenu, setIsMenu] = useState(false)
    const [showCountryDropdown, setShowCountryDropdown] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState({ code: 'JP', name: 'Japan', flag: 'jp' })
    const dropdownRef = useRef(null)

    const countries = [
        { code: 'JP', name: 'Japan', flag: 'jp' },
        { code: 'US', name: 'United States', flag: 'us' },
        { code: 'GB', name: 'United Kingdom', flag: 'gb' },
        { code: 'CA', name: 'Canada', flag: 'ca' },
        { code: 'AU', name: 'Australia', flag: 'au' },
        { code: 'DE', name: 'Germany', flag: 'de' },
        { code: 'FR', name: 'France', flag: 'fr' },
        { code: 'IT', name: 'Italy', flag: 'it' },
        { code: 'ES', name: 'Spain', flag: 'es' },
        { code: 'KR', name: 'South Korea', flag: 'kr' }
    ]

    const handleCountrySelect = (country) => {
        setSelectedCountry(country)
        setShowCountryDropdown(false)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])


    useEffect(() => { cart.cartCount() }, [cart])

    const isLoggedIn = () => {
        if (user && user?.id) {
            return (
                <button 
                    onClick={() => !isMenu ? setIsMenu(true) : setIsMenu(false)} 
                    className="flex items-center gap-2 hover:underline cursor-pointer"
                >
                    <div>Hi, {user.name}</div>
                    <BsChevronDown/>
                </button>
            )
        } 

        return (
            <Link href="/auth" className="flex items-center gap-2 hover:underline cursor-pointer">
                <div>Login</div>
                <BsChevronDown/>
            </Link>
        )
    }

    return (
        <>
            <div id="TopMenu" className="border-b">
                <div className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
                    <ul 
                        id="TopMenuLeft"
                        className="flex items-center text-[11px] text-[#333333] px-2 h-8"
                    >
                        <li className="relative flex items-center px-3 hover:underline cursor-pointer">
                            <span className={`fi fi-${selectedCountry.flag} w-[18px] h-[18px] rounded-sm`}></span>
                            <span className="pl-[3px] pr-[2px]">{selectedCountry.code}</span>
                        </li>
                        <li className="px-3 hover:underline cursor-pointer">
                            Daily Deals
                        </li>
                        <li className="px-3 hover:underline cursor-pointer">
                            Help & Contact
                        </li>

                    </ul>

                    <ul 
                        id="TopMenuRight"
                        className="flex items-center text-[11px] text-[#333333] px-2 h-8"
                    >
                        <li className="relative" ref={dropdownRef}>
                            <div 
                                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                className="flex items-center gap-2 px-3 hover:underline cursor-pointer"
                            >
                                <span className={`fi fi-${selectedCountry.flag} w-[32px] h-[32px] rounded-sm`}></span>
                                Ship to {selectedCountry.name}
                            </div>

                            {showCountryDropdown && (
                                <div className="absolute top-8 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[200px]">
                                    {countries.map((country) => (
                                        <div
                                            key={country.code}
                                            onClick={() => handleCountrySelect(country)}
                                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        >
                                            <span className={`fi fi-${country.flag} w-[20px] h-[20px] rounded-sm`}></span>
                                            <span>{country.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </li>
                        <ClientOnly>
                            <li className="px-3 hover:underline cursor-pointer">
                                <div onClick={() => router.push('/cart')} className="relative">
                                    <AiOutlineShoppingCart size={22}/>
                                    {cart.cartCount() > 0 ?
                                        <div className="absolute text-[10px] -top-[2px] -right-[5px] bg-orange-600 w-[14px] h-[14px] rounded-full text-white">
                                            <div className=" flex items-center justify-center -mt-[1px]">{cart.cartCount()}</div>
                                        </div>
                                    : <div></div>}
                                </div>
                            </li>
                        </ClientOnly>
                    </ul>
                </div>
            </div>
        </>
    )
  }