'use client'

import debounce from "debounce";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineSearch } from 'react-icons/ai'
import { BiLoaderCircle } from 'react-icons/bi'
import { features } from '@/app/libs/config';

export default function MainLayout() {

    const [items, setItems] = useState([])
    const [isSearching, setIsSearching] = useState(null)

    const handleSearchName = debounce(async (event) => {
        const value = event.target.value;
        if (value === "") {
            setItems([])
            return
        }

        setIsSearching(true)

        try {
// Use enhanced AI search if enabled, otherwise fall back to regular search
            const searchEndpoint = features.aiSearch
                ? `/api/products/ai-search?q=${encodeURIComponent(value)}&vector=${features.vectorSearch}`
                : `/api/products/search-by-name/${value}`;
            
            const response = await fetch(searchEndpoint);
            const result = await response.json();

            if (result) {
                setItems(result)
                setIsSearching(false)
                return
            }
            setItems([])
            setIsSearching(false)
        } catch (error) {
            console.log(error)
            alert(error)
            setIsSearching(false)
        }
    }, 500)

    return (
        <>
            <div id="MainHeader" className="border-b">
                <nav className="flex items-center justify-between w-full mx-auto max-w-[1200px]">
                    <div className="flex items-center w-full bg-white">
                        <div className="flex lg:justify-start justify-between gap-16 max-w-[1150px] w-full px-3 py-5 mx-auto">
                            <Link href="/" className="flex items-center gap-2">
                                <img width="40" src="/images/eCom.png" alt="MagicCommerce" />
                                <span className="text-2xl font-bold text-orange-700">MagicCommerce</span>
                            </Link>

                            <div className="w-full">
                                <div className="relative">

                                    <div className="flex items-center gap-3">
                                        <div className="relative flex items-center border-2 border-orange-600 w-full p-3 rounded-l-md">

                                            <button className="flex items-center mr-3">
                                                <AiOutlineSearch size={22}/>
                                            </button>

                                            <input 
                                                className="
                                                    w-full
                                                    placeholder-gray-400
                                                    text-sm
                                                    focus:outline-none
                                                "
                                                onChange={handleSearchName}
                                                placeholder="Search for anything"
                                                type="text"
                                                suppressHydrationWarning={true}
                                            />

                                            {isSearching ? <BiLoaderCircle className="ml-3 animate-spin" size={22} /> : null}

                                            {items.length > 0 ?
                                                <div className="absolute bg-white max-w-[910px] h-auto w-full z-20 left-0 top-12 border p-1">
                                                    {items.map((item) => (
                                                        <div className="p-1" key={item.id}>
                                                            <Link 
                                                                href={`/product/${item?.id}`}
                                                                className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-200 p-1 px-2"
                                                            >
                                                                <div className="flex items-center">
                                                                    <img className="rounded-md" width="40" src={item?.url+'/40'} />
                                                                    <div className="truncate ml-2">{ item?.title }</div>
                                                                </div>
                                                                <div className="truncate text-orange-600 font-semibold">${ (item?.price / 100).toFixed(2) }</div>
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>
                                            : null}

                                        </div>

                                        <button className="flex items-center bg-orange-600 hover:bg-orange-700 text-sm font-semibold text-white py-3 px-14 rounded-r-md transition-colors" suppressHydrationWarning={true}>
                                            Search
                                        </button>

                                        <div className="text-xs px-3 hover:text-orange-600 cursor-pointer">Advanced</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </nav>
            </div>
        </>
    )
  }