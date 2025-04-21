import React from 'react'
import {Menu, Moon, Search, Settings, Sun, User} from "lucide-react";
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';
import { signOut } from 'aws-amplify/auth';
import { useGetAuthUserQuery } from '@/state/api';
import Image from 'next/image';
// justify-center：水平居中 items-center: 垂直居中
const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const { data: currentUser } = useGetAuthUserQuery({});

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }

  if (!currentUser) return null;
  const currentUserDetails = currentUser?.userDetails;


  return (
    <div className='flex items-center justify-between bg-white px-4 py-3 dark:bg-white dark:px-4 dark:py-3'>
      {/* Search Bar */}
      <div className='flex items-center gap-8'>
        {!isSidebarCollapsed? null : (
          <button onClick={() => {dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}}>
            <Menu className="h-8 w-8 dark:text-black"/>
          </button>
        )}
        <div className='relative flex h-min w-[200px]'>
          <Search className='absolute left-[4px] top-1/2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-gray-500'/>
          <input
            type="search"
            placeholder="Search..."
            className='w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-200 dark:text-white dark:placeholder-gray-500'
          />
        </div>
      </div>

      {/* ICONS */}
      <div className='flex items-center'>
        <button onClick = {() => dispatch(setIsDarkMode(!isDarkMode))} className={isDarkMode ? `rounded p-2 dark:hover:bg-gray-100` : `rounded p-2 hover:bg-gray-100`}>
          {isDarkMode ? (
            <Sun className='h-6 w-6 cursor-pointer dark: text-black'/>
          ) : (
            <Moon className='h-6 w-6 cursor-pointer dark: text-black'/>
          )
          }
        </button>
        <Link
             href="/settings"
             className={isDarkMode ? `h-min w-min rounded p-2 dark:hover:bg-gray-100` : `h-min w-min rounded p-2 hover:bg-gray-100`}
             >
             <Settings className='h-6 w-6 cursor-pointer dark:text-black'/>
        </Link>

        <div className='ml-2 mr-5 hidden min-h-[2rem] w-[0.1rem] bg-gray-200 md:inline-block'>
        </div>

        <div className='hidden item-center justify-between md:flex'>

           <div className="align-center flex h-9 w-9 justify-center">

            {!!currentUserDetails?.profilePictureUrl ? (
              <Image
                src={`https://pm-llc-s3-images.s3.ap-southeast-2.amazonaws.com/${currentUserDetails?.profilePictureUrl}`}
                alt={currentUserDetails?.username || "User Profile Picture"}
                width={100}
                height={50}
                className="h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 cursor-pointer self-center rounded-full" />
            )}
          </div>

       

          <span className='mx-3 text-gray-800'>
            {currentUserDetails?.username}
          </span>

          <button className='hidden rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block' onClick={handleSignOut}>
            Sign out
          </button> 
        
        </div>
      </div>
    </div>
  )
}

export default Navbar