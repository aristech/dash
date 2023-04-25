import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
// import { logoutUser } from 'src/features/user/userSlice';
import { logoutUser, toggleSidebar } from '@/features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
// import logo from '../../assets/imgs/logo.png'
import Stack from '@mui/material/Stack';
import LogoutButton from './Buttons/LogoutButton';
import AvatarSettings from './Buttons/AvatarSettings';
import Image from 'next/image'
import { store } from '@/store';





const userName = "John Smith"




const AdminNavbar = () => {
   const {isSidebarOpen} = useSelector(store => store.user)
   const dispatch = useDispatch();
   const toggle = () => {
      dispatch(toggleSidebar())
   }

   const URL = isSidebarOpen ? '/static/imgs/dg-small.png' : '/static/imgs/logoDG.png'
   return (
      <Stack sx={{ bgcolor: 'white', width: '100%', p: '10px', height: 70, position: 'fixed', zIndex: 12 }} direction="row"   >
         <Stack direction="row" alignItems={"center"}>
            <Burger onClick={toggle} />
            <Image
               src={URL}
               alt="Picture of the author"
               width={isSidebarOpen ? 50 : 100}
               height={isSidebarOpen ? 50 : 28}
            />

         </Stack>
         <Stack direction="row" justifyContent="flex-end" alignItems="center" width="100%">
            {/* <LogoutButton userName={userName} /> */}
            <AvatarSettings />
         </Stack>
         
      </Stack >
   )
}



const Burger = ({ onClick }) => {
   return (
      <IconButton  sx={{ marginRight: '10px', width: 40, height: 40, borderRadius: 1, }} onClick={onClick}>
         <MenuIcon color='primary' />
      </IconButton>
   )
}




export default AdminNavbar