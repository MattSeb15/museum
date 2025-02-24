'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Cuboid, LandmarkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { useSite } from '@/lib/store/site-context'
import { hexColorToRGB } from '@/lib/utils'

type Artwork = {
	id: string
	title: string
	category: string
	image_url: string
	year: string
}

export default function Home() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Todo')
	const [artworks, setArtworks] = useState<Artwork[]>([])
	const [categories, setCategories] = useState<string[]>(['Todo'])
	const [loading, setLoading] = useState(true)
	const { config } = useSite()
	const bgColor = hexColorToRGB(config?.background_color || 'ffffff', 0.8)
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)
			const { data: artworksData } = await supabase
				.from('artworks')
				.select('*')
				.order('created_at', { ascending: false })

			if (artworksData) {
				setArtworks(artworksData)
				// Extract unique categories from artworks
				const uniqueCategories = [
					'Todo',
					...new Set(artworksData.map(art => art.category)),
				]
				setCategories(uniqueCategories)
			}
			setLoading(false)
		}

		fetchData()
	}, [])

	const filteredArtworks =
		selectedCategory === 'Todo'
			? artworks
			: artworks.filter(art => art.category === selectedCategory)

	return (
		<div className='min-h-screen pt-20'>
			{/* Navigation Button */}
			<div className='fixed bottom-8 right-8 z-50'>
				<Link href='/museum'>
					<motion.button
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className='w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors'>
						<LandmarkIcon className='w-6 h-6' />
					</motion.button>
				</Link>
			</div>

			{/* Categories */}
			{config?.text_color ? (
				<div
					style={{
						backgroundColor: bgColor || 'white',
						color: config?.text_color || 'black',
					}}
					className='sticky top-20 bg-white/80 backdrop-blur-sm z-40 py-4 border-b'>
					<div className='max-w-7xl mx-auto px-4'>
						<div className='px-4 flex overflow-x-auto space-x-6 pb-2 scrollbar-hide'>
							{categories.map(category => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`text-sm whitespace-nowrap px-4 py-2 rounded-full transition-colors duration-300
                  ${
										selectedCategory === category
											? 'bg-black text-white'
											: 'text-gray-600 hover:text-black'
									}`}>
									{category}
								</button>
							))}
						</div>
					</div>
				</div>
			) : (
				<div className='sticky top-20 bg-white/80 backdrop-blur-sm z-40 py-4 border-b'>
					<div className='max-w-7xl mx-auto px-4'>
						<div className='px-4 flex overflow-x-auto space-x-6 pb-2 scrollbar-hide'>
							<Skeleton className='h-8 w-full animate-pulse rounded-md px-5' />
						</div>
					</div>
				</div>
			)}

			{/* Artwork Grid */}
			<div className='max-w-7xl mx-auto px-4 py-8'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
					{loading
						? // Loading skeletons
						  Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className='space-y-4'>
									<Skeleton className='h-[400px] w-full' />
									<Skeleton className='h-6 w-2/3' />
									<Skeleton className='h-4 w-1/3' />
								</div>
						  ))
						: filteredArtworks.map((artwork, index) => (
								<ArtworkCard
									key={artwork.id}
									{...artwork}
									index={index}
								/>
						  ))}
				</div>
			</div>
		</div>
	)
}

const ArtworkCard = ({ id, title, image_url, category, year, index }: any) => {
	const [ref, inView] = useInView({
		triggerOnce: true,
		threshold: 0.1,
	})

	return (
		<Link href={`/artwork/${id}`}>
			<motion.div
				ref={ref}
				initial={{ opacity: 0, y: 50 }}
				animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
				transition={{ duration: 0.6, delay: index * 0.1 }}
				className='group cursor-pointer'>
				<div className='relative h-[400px] mb-4 overflow-hidden'>
					<Image
						src={image_url}
						alt={title}
						fill
						className='object-cover transition-transform duration-500 group-hover:scale-110'
					/>
				</div>
				<div className='space-y-1'>
					<h3 className='text-xl font-light'>{title}</h3>
					<div className='flex justify-between text-sm text-gray-600'>
						<span>{category}</span>
						<span>{year}</span>
					</div>
				</div>
			</motion.div>
		</Link>
	)
}
