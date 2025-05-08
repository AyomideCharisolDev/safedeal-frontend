import './style.css'
import { useState } from "react";
import { HomeIcon, Watch } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Slide } from "react-awesome-reveal";
import TawkMessenger from '../tawk';

const NavBar = ({ active }: any) => {
   const [openNav, setOpenNav] = useState(false);
   const Navigate = useNavigate();
   const token = localStorage.getItem('adesina_token')


   const menus = [
      {
         title: "About",
         icon: <Watch />,
         url: "/about"
      },
      {
         title: "Cities",
         icon: <HomeIcon />,
         url: "/cities"
      },
      {
         title: "Watch",
         icon: <Watch />,
         url: "/watch"
      },
      {
         title: "Contact Us",
         icon: <Watch />,
         url: "/contact"
      },
   ]

   return (
      <>
      <TawkMessenger/>
         <nav className='hidden-xs bg-bla,,k'>
            <div className='container space-btw flex'>
               <span className='aaj-logo' onClick={() => { Navigate('/') }}><img src="/logo_white.png" alt="" /></span>
               <div className='flex space-50'>
                  {menus?.map((i, index) => (
                     <span className={`links alice px12 poppings-light ${i.title == active && 'active'} `} onClick={() => { Navigate(i.url) }}>{i.title}</span>
                  ))}
               </div>
               <Slide direction='right'>
                  <button className="button xs-px15 px10 alice besley-regular" onClick={() => { Navigate('/contact') }}>Join Us</button>
               </Slide>
            </div>
         </nav>










         {openNav &&
            <div className='nav-my-modal' onClick={() => { setOpenNav(false) }}>
               <div className='side-nav' onClick={(e) => { e.stopPropagation() }}>
                  <i className='fas fa-times white xs-px20 pd-10' onClick={() => { setOpenNav(false) }}></i>
                  <div className='my-mother xs-down-10vh space-50 v-gap-20'>{menus?.map((i, index) => (
                     <Slide direction='up'>
                        <span className={`links alice px12 xs-px20 besley-regular ${i.title == active && 'active'} `} onClick={() => { Navigate(i.url) }}>{i.title}</span>
                     </Slide>
                  ))}</div>
               </div>
               {/* <div className='my-mother'><span className='aaj-logo' onClick={()=> {Navigate('/')}}><img src="/logo.svg" alt="" /></span></div> */}
            </div>
         }

         <div className='mobile-nav bg-black xs-12 hidden-ls'>
            <div className='xs-11 centered-align flex space-btw'>
               <div className='aaj-logo bg-blak xs-down3' onClick={() => { Navigate('/') }}><img src="/logo_white.png" alt="" /></div>
               <div>
                  <span onClick={() => { setOpenNav(true) }} className='bars'></span>
               </div>
            </div>
         </div>

      </>
   )
}

export default NavBar;