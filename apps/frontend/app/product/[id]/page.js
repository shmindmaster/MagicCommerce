"use client"

import MainLayout from "../../layouts/MainLayout"
import SimilarProducts from "../../components/SimilarProducts"
import ProductQnA from "../../components/ProductQnA"
import { useEffect, useState } from "react"
import useIsLoading from "../../hooks/useIsLoading"
import { useCart } from "../../context/cart"
import { toast } from "react-toastify"
import { features } from '@/app/libs/config';

export default function Product({ params }) {
  const cart = useCart()

  const [product, setProduct] = useState({})
  const [aiDescription, setAiDescription] = useState('')

  const getProduct = async () => {
    useIsLoading(true)
    setProduct({})

    try {
      const response = await fetch(`/api/product/${params.id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const prod = await response.json()
      setProduct(prod)
      cart.isItemAddedToCart(prod)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      useIsLoading(false)
    }
  }

  useEffect(() => { 
    getProduct() 
  }, [])

  // Log product view analytics
  useEffect(() => {
    if (!params?.id) return;
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "view_product", productId: Number(params.id) }),
    }).catch(() => {
      // best-effort only
    });
  }, [params.id])

  return (
    <>
      <MainLayout>

        <div className="max-w-[1200px] mx-auto">
          <div className="flex px-4 py-10">

            {product?.url 
              ? <img className="w-[40%] rounded-lg" src={product?.url+'/280'} /> 
              : <div className="w-[40%]"></div> 
            }

            <div className="px-4 w-full">
              <div className="font-bold text-xl">{product?.title}</div>
              <div className="text-sm text-gray-700 pt-2">Brand New - Full Warranty</div>

              <div className="border-b py-1" />

              <div className="pt-3 pb-2">
                <div className="flex items-center">
                  Condition: <span className="font-bold text-[17px] ml-2">New</span>
                </div>
              </div>

              <div className="border-b py-1" />

              <div className="pt-3">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center">
                    Price: 
                    {product?.price 
                      ? <div className="font-bold text-[24px] text-orange-600">
                          ${(product?.price / 100).toFixed(2)}
                        </div> 
                    : null }
                  </div>
                  <button 
                    onClick={() => {
                      if (cart.isItemAdded) {
                        cart.removeFromCart(product)
                        toast.info('Removed from cart', { autoClose: 3000 })
                      } else {
                        cart.addToCart(product)
                        toast.success('Added to cart', { autoClose: 3000 })
                      }
                    }} 
                    className={`
                      text-white py-2 px-20 rounded-full cursor-pointer 
                      ${cart.isItemAdded ? 'bg-[#e9a321] hover:bg-[#bf851a]' : 'bg-[#3498C9] hover:bg-[#0054A0]'}
                    `}
                  >
                      {cart.isItemAdded ? 'Remove From Cart' : 'Add To Cart'}
                  </button>
                </div>
              </div>

              <div className="border-b py-1" />

        <div className="pt-3">
          <div className="font-semibold pb-1">Description:</div>
          <div className="text-sm">{product?.description}</div>
          {product?.id && (
            <div className="mt-4">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/products/descriptions?productId=${product.id}`);
                    if (!res.ok) throw new Error('Failed');
                    const data = await res.json();
                    setAiDescription(data.description);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-1 rounded"
              >
                Generate AI Description
              </button>
              {aiDescription && (
                <div className="mt-2 p-2 border rounded bg-gray-50 text-sm">
                  {aiDescription}
                </div>
              )}
            </div>
          )}
        </div>


              {features.aiProductQnA && product?.id && (
                <ProductQnA productId={product.id} />
              )}

            </div>
          </div>
        </div>

        <SimilarProducts productId={product?.id} />

        </MainLayout>
    </>
  )
}