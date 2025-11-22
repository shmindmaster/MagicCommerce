'use client';

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function CarouselComp() {

    const compData = [
        {
            id: 1,
            title: "Credits applied to your account",
            text: "Earn $5 in credits when you sign up for the first time",
            url: "/images/banner/1.png"
        },
        {
            id: 2,
            title: "Save on shipments",
            text: "Fast and reliable shipping for under $2.99",
            url: "/images/banner/2.png"
        },
        {
            id: 3,
            title: "MagicCommerce Mobile App",
            text: "Stay connected and browse with our mobile app",
            url: "/images/banner/3.png"
        }
    ]

    return (
        <>
            <div className="max-w-[1200px] mx-auto px-3" suppressHydrationWarning={true}>
                <div suppressHydrationWarning={true}>
                    <Carousel 
                        showArrows={true} 
                        autoPlay={true} 
                        interval={3000} 
                        infiniteLoop={true} 
                        showStatus={false}
                        showIndicators={true}
                        showThumbs={true}
                    >
                        {compData.map(item => (
                            <div key={item.id}>
                                <img src={item.url} alt={item.title} />
                            </div>
                        ))}
                    </Carousel>
                </div>
            </div>
        </>
    )
}