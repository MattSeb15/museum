'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import {
	Palette,
	ShoppingBag,
	User,
	Settings,
	LogOut,
	LandmarkIcon,
} from 'lucide-react'
import DashboardLoading from './loading'
import { ArtworksSection } from './components/ArtworksSection'
import { ShopSection } from './components/ShopSection'
import { AboutSection } from './components/AboutSection'
import { SettingsSection } from './components/SettingsSection'
import Link from 'next/link'
import { MuseumSection } from './components/MuseumSection'

const sections = [
	{
		id: 'artworks',
		name: 'Obras',
		icon: Palette,
		component: ArtworksSection,
	},
	{ id: 'shop', name: 'Tienda', icon: ShoppingBag, component: ShopSection },
	{ id: 'about', name: 'Acerca de', icon: User, component: AboutSection },
	{ id: 'museum', name: 'Museo', icon: LandmarkIcon, component: MuseumSection },
	{
		id: 'settings',
		name: 'Configuraciones',
		icon: Settings,
		component: SettingsSection,
	},
]

export default function AdminDashboard() {
	const [currentTab, setCurrentTab] = useState('artworks')
	const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
	const router = useRouter()
	const supabase = createClientComponentClient()

	useEffect(() => {
		const checkAdmin = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (!session) {
				router.push('/admin/login')
				return
			}

			const { data: adminUser } = await supabase
				.from('admin_users')
				.select('id')
				.eq('id', session.user.id)
				.single()

			if (!adminUser) {
				router.push('/admin/login')
			} else {
				setIsAdmin(true)
			}
		}

		checkAdmin()
	}, [router, supabase])

	const searchParams = useSearchParams()

	useEffect(() => {
		const tab = searchParams.get('tab')
		if (tab) {
			setCurrentTab(tab)
		}
	}, [router, searchParams])

	const handleSignOut = async () => {
		await supabase.auth.signOut()
		router.push('/admin/login')
	}

	if (isAdmin === null) {
		return <DashboardLoading />
	}

	const ActiveSectionComponent =
		sections.find(s => s.id === currentTab)?.component || sections[0].component

	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Navigation */}
			<nav className='fixed w-full bg-white shadow-sm z-10'>
				<div className='max-w-7xl mx-auto px-4'>
					<div className='flex justify-between items-center h-16'>
						<h1 className='text-xl font-light'>Admin Dashboard</h1>
						<button
							onClick={handleSignOut}
							className='flex items-center text-gray-600 hover:text-black'>
							<LogOut className='w-5 h-5 mr-2' />
							Sign Out
						</button>
					</div>
				</div>
			</nav>

			<div className='pt-16 flex md:flex-row flex-col'>
				{/* Sidebar */}
				<div className='w-full md:w-64 z-[10] fixed md:h-full bg-white shadow-sm'>
					<div className='p-4'>
						<div className='space-y-1 flex gap-2 md:inline'>
							{sections.map(section => (
								<Link
									key={section.id}
									href={`/admin/dashboard?tab=${section.id}`}
									className={`w-fit flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
										currentTab === section.id
											? 'bg-black text-white'
											: 'text-gray-600 hover:bg-gray-100'
									}`}>
									<section.icon className='w-5 h-5' />
									<span className='hidden md:inline-block'>{section.name}</span>
								</Link>
							))}
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className='flex-1 mt-24  md:ml-64 md:mt-0 p-8'>
					<div className='max-w-5xl mx-auto'>
						<ActiveSectionComponent />
					</div>
				</div>
			</div>
		</div>
	)
}
