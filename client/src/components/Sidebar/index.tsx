"use client"
import React,{useState} from 'react'
import Image from 'next/image';
import { AlertCircle, AlertOctagon, AlertTriangle, Briefcase, ChevronDown, ChevronUp, Layers3, LockIcon, LucideIcon,Search,Settings,ShieldAlert,User,Users,X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { setIsSidebarCollapsed } from '@/state';
import { useGetAuthUserQuery, useGetProjectsQuery } from '@/state/api';
import { signOut } from 'aws-amplify/auth';

const Sidebar = () => {
    const [showProjects, setShowProjects] = useState(true);
    const [showPriority, setShowPriority] = useState(true);

    const {data: projects} = useGetProjectsQuery();
    const dispatch = useAppDispatch();
    const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed,);
    
    const {data: currentUser} = useGetAuthUserQuery({});
    
    const handleSignOut = async() => {
        try {
            await signOut(); 
        } catch (error) {
            console.error("Error signing out: ",error)
        }
    }

    if(!currentUser) return null;
    const currentUserDetails = currentUser?.userDetails;

    

    const sidebarClassnames = `fixed flex flex-col h-[100%] justify-between shadow-2xl transition-all duration-300 h-full z-40 dark:bg-white overflow-y-auto bg-white w-64 ${
        isSidebarCollapsed ? "w-0 hidden" : "w-64"
    }`
  return (
    <div className={sidebarClassnames}>
        <div className='flex h-[100%] w-full flex-col justify-start'>
            {/* LOGO */}
            <div className='z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-wite'>
                <div className='text-xl font-bold text-gray-800'>
                    LEOLIST
                </div>
            </div>
            {isSidebarCollapsed ? null : (
                <button className='py-3' onClick={() => {dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}}>
                    <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-gray-800" />
                </button>
            )}

            {/* TEAM */}
            <div className='flex items-center gap-5 border-y-[1.5px]  border-gray-200 px-8 py-4 dark:border-gray-200'>
                <Image src="https://pm-llc-s3-images.s3.ap-southeast-2.amazonaws.com/logo.png" alt="Logo" width={40} height={40}/>
                <div>
                    <h3 className='text-md font-bold tracking-wide dark:text-gray-800'>
                        LEOLI TEAM
                    </h3>
                    <div className='mt-1 flex items-start gap-2'>
                        <LockIcon className='mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-500'/>
                        <p className='text-xs text-gray-500'>Private</p>
                    </div>
                </div>
            </div>
            {/* NAVBAR LINKS */}
            <nav className='z-10 w-full'>
                <SidebarLink
                icon={Home}       
                label="Home"
                href="/"/>

                <SidebarLink
                icon={Briefcase}       
                label="Timeline"
                href="/timeline"/>

                <SidebarLink
                icon={Search}       
                label="Search"
                href="/search"/>

                <SidebarLink
                icon={Settings}       
                label="Settings"
                href="/settings"/>

                <SidebarLink
                icon={User}       
                label="Users"
                href="/users"/>

                <SidebarLink
                icon={Users}       
                label="Teams"
                href="/teams"/>
                
            </nav>

            {/* PROJECTS LINKS*/}
            <button
                    onClick= {() => {
                        setShowProjects((prev) => !prev)
                    }}
                    className='flex w-full items-center justify-between px-8 py-3 text-gray-500'
            >
                <span className=''>Projects</span>
                {showProjects ? (
                    <ChevronUp className='h-5 w-5'/>
                ): (
                    <ChevronDown className='h-5 w-5'/>
                )}

            </button>
            {/* PROJECTS LIST */}
            {showProjects && projects?.map((project) => (
                <SidebarLink
                    key={project.id}
                    icon={Briefcase}
                    label={project.name}
                    href={`/projects/${project.id}`}
                />
            ))}
            {/* PRIORITIES LINKS */}
            <button
                    onClick= {() => {
                        setShowPriority((prev) => !prev)
                    }}
                    className='flex w-full items-center justify-between px-8 py-3 text-gray-500'
            >
                <span className=''>Priorities</span>
                {showPriority ? (
                    <ChevronUp className='h-5 w-5'/>
                ): (
                    <ChevronDown className='h-5 w-5'/>
                )}

            </button>
            {showPriority && (
                <>
                    <SidebarLink icon={AlertCircle} label="Urgent" href="/priority/urgent"/>
                    <SidebarLink icon={ShieldAlert} label="High" href="/priority/high"/>
                    <SidebarLink icon={AlertTriangle} label="Medium" href="/priority/medium"/>
                    <SidebarLink icon={AlertOctagon} label="Low" href="/priority/low"/>
                    <SidebarLink icon={Layers3} label="Backlog" href="/priority/backlog"/>
                </>
            )}

        </div>

        <div className="z-10 mt-2 flex w-full flex-col items-center gap-4 bg-white px-8 py-4 md:hidden">
            <div className="flex w-full items-center">
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
                <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
                )}
            </div>
            <span className="mx-3 text-gray-800 dark:text-white">
                {currentUserDetails?.username}
            </span>
            <button
                className="self-start rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block"
                onClick={handleSignOut}
            >
                Sign out
            </button>
            </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
}

const SidebarLink = ({
    href,
    icon: Icon,
    label,
}: SidebarLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname === "/" && href === "/dashboard");
    // 直接比较 pathname === href，如果当前路径匹配 href，则高亮当前链接。
    // 特别处理 /dashboard：
    // 当 pathname 为 / 且 href 为 /dashboard 时，仍然高亮，适用于将 / 作为 /dashboard 的别名的情况。

    return (
        <Link href={href} className="w-full">
            <div className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark: bg-gray-100 dark:hover:bg-gray-200 ${
                isActive? "bg-gray-100 text-white dark:bg-gray-100" : ""
            } justify-start px-8 py-3`}>

                {isActive && (
                    <div className='absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200'/>
                )}

                <Icon className="h-6 w-6 text-gray-800 dark:text-gray-800" />
                <span className={`font-medium text-gray-800 dark:text-gray-800`}>
                    {label}
                </span>
            </div>
        </Link>
    );
}

export default Sidebar