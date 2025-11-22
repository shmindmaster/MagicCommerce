import "./globals.css"
import { Provider as UserProvider } from './context/user'
import CartProvider from './context/cart'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata = {
  title: 'MagicCommerce - Your Premier Online Marketplace',
  description: 'Discover amazing products at MagicCommerce - Your trusted online shopping destination',
}
 
export default function RootLayout({ children }) {

 return (
    <html lang="en">
      <body>
        <div>
          <ToastContainer />

          <UserProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </UserProvider>
        </div>
      </body>
    </html>
  )
}
