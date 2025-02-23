'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
	Menu,
	Instagram,
	Twitter,
	Youtube,
	ShoppingBag,
	User,
} from 'lucide-react'
import { useState } from 'react'
import { useSite } from '@/lib/store/site-context'
import { hexColorToRGB } from '@/lib/utils'

const Navigation = () => {
	const [isOpen, setIsOpen] = useState(false)
	const { config } = useSite()

	const socialLinks = [
		{
			icon: Instagram,
			href: 'https://instagram.com/kerli',
			label: 'Instagram',
		},
		{ icon: Twitter, href: 'https://twitter.com/kerli', label: 'Twitter' },
		{ icon: Youtube, href: 'https://youtube.com/kerli', label: 'YouTube' },
	]
	const bgColor = hexColorToRGB(config?.background_color || 'ffffff', 0.8)

	return (
		<nav
			style={{
				backgroundColor: bgColor || 'white',
				color: config?.text_color || 'black',
			}}
			className='fixed w-full z-50 backdrop-blur-sm'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-20'>
					<Link
						href='/'
						className='text-2xl font-light tracking-wider'>
						{config?.museum_name || 'MUSEO DE KERLI'}
					</Link>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center space-x-8'>
						<Link
							href='/about'
							className='flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-300'>
							<User className='h-5 w-5' />
							<span>Acerca de</span>
						</Link>
						{config?.enable_shop && (
							<Link
								href='/shop'
								className='flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-300'>
								<ShoppingBag className='h-5 w-5' />
								<span>Tienda</span>
							</Link>
						)}
						{socialLinks.map(social => (
							<Link
								key={social.label}
								href={social.href}
								target='_blank'
								rel='noopener noreferrer'
								className='text-gray-600 hover:text-black transition-colors duration-300'
								aria-label={social.label}>
								<social.icon className='h-5 w-5' />
							</Link>
						))}
					</div>

					{/* Mobile Menu Button */}
					<button
						className='md:hidden'
						onClick={() => setIsOpen(!isOpen)}
						aria-label='Toggle menu'>
						<Menu className='h-6 w-6' />
					</button>
				</div>
			</div>

			{/* Mobile Menu */}
			{isOpen && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					style={{ backgroundColor: bgColor || 'white' }}
					className='md:hidden'>
					<div className='px-4 pt-2 pb-4 space-y-4'>
						<Link
							href='/about'
							className='flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-300 py-2'
							onClick={() => setIsOpen(false)}>
							<User className='h-5 w-5' />
							<span>Acerca de</span>
						</Link>
						{config?.enable_shop && (
							<Link
								href='/shop'
								className='flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-300 py-2'
								onClick={() => setIsOpen(false)}>
								<ShoppingBag className='h-5 w-5' />
								<span>Tienda</span>
							</Link>
						)}
						<div className='flex justify-center space-x-6'>
							{socialLinks.map(social => (
								<Link
									key={social.label}
									href={social.href}
									target='_blank'
									rel='noopener noreferrer'
									className='text-gray-600 hover:text-black transition-colors duration-300'
									onClick={() => setIsOpen(false)}
									aria-label={social.label}>
									<social.icon className='h-5 w-5' />
								</Link>
							))}
						</div>
					</div>
				</motion.div>
			)}
		</nav>
	)
}

export default Navigation
