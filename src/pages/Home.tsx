import { useState, useEffect } from 'react'

import { Locate, MapPin, Phone, Pin, Star, Quote, Box } from 'lucide-react'
import ItemCards from '../components/ItemCards';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import CountUp from 'react-countup';
import NavigationButton from '../components/NavigationButton';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useQuery } from '@tanstack/react-query';
import TypewriterText from '../components/TypewriterText';
import ScrollingBanner from '../components/ScrollingBanner';
import { Image } from '@heroui/react';
import { deleteOrdersByCustomerUid } from '@/services/orderService';
import { motion, Variants } from 'framer-motion';

// Define the Review interface
interface Review {
  id: string;
  name: string;
  work: string;
  place: string;
  review: string;
  avatarUrl: string;
}

const fetchReviews = async (): Promise<Review[]> => {
  const reviewsCollection = collection(db, 'reviews');
  const reviewSnapshot = await getDocs(reviewsCollection);
  return reviewSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Review[];
};

const Home = () => {
  const userDetails = useAuthStore((state) => state.userDetails)
  const navigate = useNavigate()
  const products = useProductStore((state) => state.products)
  const [swiperRef, setSwiperRef] = useState(null);


  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // For review card scrolling (copied from Customers page)
  const [reviewStartIndex, setReviewStartIndex] = useState(0);
  const getVisibleReviewCards = () => {
    const cards = [];
    for (let i = 0; i < reviews.length * 2; i++) {
      const index = (reviewStartIndex + i) % reviews.length;
      cards.push(reviews[index]);
    }
    return cards;
  };
  const handleReviewScroll = (direction: 'left' | 'right') => {
    const container = document.querySelector('.scroll-container');
    if (container) {
      container.classList.remove('animate-scroll');
      if (direction === 'right') {
        setReviewStartIndex((prev) => (prev + 1) % reviews.length);
      } else {
        setReviewStartIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      }
      setTimeout(() => {
        container.classList.add('animate-scroll');
      }, 500);
    }
  };

  const varieties = [
    {
      id: 1,
      name: "Paav Bhaaji",
      img: "/paavai.webp",
      link: "/shop/?tag=paav-bhaaji"
    },
    {
      id: 2,
      name: "Egg Curry",
      img: "egg.jpg",
      link: "/shop/?tag=meals"
    },
    {
      id: 3,
      name: "Pasta",
      img: "/pasta2.jpg",
      link: "/shop/?tag=pasta"
    },
    {
      id: 4,
      name: "Meals",
      img: "meal.jpg",
      link: "/shop/?tag=meals"
    }
  ]
  // useEffect(() => {
  //   const deleteOrders = async () => {
  //     await deleteOrdersByCustomerUid('3IIckUCL9tXmr96y4QxHegYtoas2');
  //   };
  //   deleteOrders();
  // }, []);
  return (
    <main className="min-h-[calc(100vh-64px)] w-full overflow-x-hidden">
      <ScrollingBanner />

     <Link
  to="https://zomato.onelink.me/xqzv/ut3cavr1"
  target="_blank"
  className="relative flex items-center justify-center h-14 bg-[#f44336] overflow-hidden group shadow-sm"
>
  {/* Subtle glowing dot left */}
  <div className="absolute left-5 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>

  {/* Shimmer animation */}
  <div className="absolute inset-0 bg-white/10 blur-sm animate-slideBg pointer-events-none"></div>

  {/* Text & Logo */}
  <div className="relative z-10 flex items-center gap-3 text-white font-medium tracking-wide text-sm sm:text-base">
    <span className="opacity-90 group-hover:opacity-100 transition-all duration-300">
      Now Available On
    </span>
    <img
      src="https://cdn.brandfetch.io/idEql8nEWn/theme/light/logo.svg?c=1dxbfHSJFAPEGdCLU4o5B"
      alt="Zomato"
      className="h-6 sm:h-8 transition-transform duration-300 ease-in-out group-hover:scale-105"
    />
  </div>

  {/* Subtle glowing dot right */}
  <div className="absolute right-5 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>

</Link>



      <section className='bg-[#fff9f2]'>
        <div className="container mx-auto px-4 py-10 md:py-30 flex flex-col md:flex-row items-center gap-4 md:gap-0 sm:px-30 md:justify-between">

          {/* Left Column */}
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left justify-center md:justify-start mt-2 md:mt-0">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl lancelot mb-3 text-gray-900 animate-[fadeIn_0.6s_ease-out] flex items-center gap-2">
  <span className="text-green-600">Enjoy</span>
  <div className="loader text-orange-500">
    <div className="words">
      <span className="word">Meals</span>
      <span className="word">Pasta</span>
      <span className="word">Maggi</span>
      <span className="word">Deserts</span>
      <span className="word">Snacks</span>
    </div>
  </div>
</h1>

            <p className="text-gray-700 text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 max-w-xl leading-relaxed font-medium animate-[fadeIn_0.8s_ease-in] tracking-wide">
  <TypewriterText
    text="Freshly prepared with love — nutritious, homestyle meals delivered just the way you like it."
    speed={50}
  />
</p>

            <div className='mb-2'>
              {userDetails?.role === 'admin' ?
                <button className="cssbuttons-io animate-pulse" onClick={() => navigate('/admin/view-all-orders')}>
                  <span className='flex items-center gap-2'>
                    <Box className='animate-bounce' />
                    Manage Orders
                  </span>
                </button>
                :
                <button className="animated-order-btn" onClick={() => navigate("/shop")}> <span>Order Now</span> </button>
              }
            </div>

          </div>

          {/* Right Column */}
          <div className="w-full md:w-2/5 md:mt-0 mt-4">
            <img
              src="/indian-plate.png"
              alt="Blog Hero Image"
              className="object-cover w-full rounded-2xl transition-all duration-300 h-auto hover:scale-105"
            />
          </div>

        </div>
      </section>

      {/* ------varieties------ */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-orange-50 via-white to-green-50 mt-10 md:mt-16 mb-10 md:mb-16">
        <div className="container mx-auto">
          <h1 className="text-center mb-10 lancelot text-3xl sm:text-4xl md:text-5xl flex items-center justify-center tracking-wide">
            Explore&nbsp;
            <span className="text-orange-600 font-bold transition duration-700 ease-in-out">Food</span>
            &nbsp;Varieties
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 px-2 md:px-8">
            {varieties.map(variety => (
              <div
                key={variety.id}
                onClick={() => navigate(variety.link)}
                className="group p-3 md:p-4 flex flex-col items-center gap-3 cursor-pointer bg-white rounded-2xl shadow hover:shadow-lg border border-orange-100 transition-all duration-300 ease-in hover:-translate-y-1"
              >
                <div className="hover:scale-105 transition-all duration-300 ease-in rounded-full overflow-hidden border-4 border-orange-100 group-hover:border-orange-300 bg-white">
                  <img className="rounded-full object-cover w-32 h-32 md:w-36 md:h-36" src={variety.img} alt={variety.name} />
                </div>
                <p className="text-lg md:text-xl font-semibold lancelot text-center mt-2 text-gray-800 group-hover:text-orange-600 transition-colors duration-200">{variety.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -----popular dishes----- */}
      <section className='bg-[#fff9f2] py-10 md:py-20 mt-10'>
        <h1 className='text-center my-10 lancelot text-5xl sm:text-6xl lg:text-7xl flex items-center justify-center'>Popular Dishes</h1>
        <div className='mx-2 md:mx-40'>
          <Swiper className=''
            spaceBetween={40}
            modules={[Navigation, Autoplay]}
            autoplay={{
              delay: 3500,
              disableOnInteraction: true,
            }}
            loop={true}
            breakpoints={{
              // when window width is >= 768px (md)
              768: {
                slidesPerView: 3
              },
              // when window width is < 768px
              0: {
                slidesPerView: 1
              }
            }}
            onSwiper={setSwiperRef}>

            {products?.slice(0, 9).map((item, index) => (
              <SwiperSlide key={index}>
                <ItemCards item={item} key={index} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='flex justify-center my-5'>
            <NavigationButton swiper={swiperRef} />
          </div>
          <div className="flex justify-center w-full">
            <button onClick={() => navigate('/shop')} className="shop-all-btn w-1/2 md:w-36">
              Check All
            </button>
          </div>

        </div>
      </section>

      {/* -----reviews----- */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-green-100 via-white to-green-50 mt-10 md:mt-16 mb-10 md:mb-16">
        <div className="container mx-auto px-2 sm:px-4 md:px-8">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold lancelot mb-2 md:mb-4 text-gray-900">
              What Our <span className="text-orange-500 animate-glow">Customers</span> Say
            </h2>
            <p className="text-gray-500 text-base md:text-lg font-medium">Real feedback from our valued customers</p>
          </div>
          <div className="relative max-w-[90%] mx-auto">
            <button 
              onClick={() => handleReviewScroll('left')}
              className="absolute left-[-40px] top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-100"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={() => handleReviewScroll('right')}
              className="absolute right-[-40px] top-1/2 -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-100"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
            <div className="relative overflow-hidden py-8">
              <div className="scroll-container animate-scroll flex gap-6">
                {!isLoading && getVisibleReviewCards().map((review, index) => (
                  <motion.div
                    key={index}
                    className="flex-none w-[280px]"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 transition-all duration-300 border border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-orange-200">
                          <img
                            src={review.avatarUrl}
                            alt={review.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate">{review.name}</h3>
                          <p className="text-gray-600 text-sm">{review.work}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 italic text-sm mt-4 line-clamp-3">
                        "{review.review}"
                      </p>
                      <div className="mt-4 text-sm text-gray-500 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243" /></svg>
                        {review.place}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home