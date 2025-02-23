'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

type AboutContent = {
	hero_image: string
	artist_image: string
	artist_name: string
	hero_subtitle: string
	bio_text: string[]
	achievements: {
		icon: string
		title: string
		value: string
	}[]
	quote: string
	quote_author: string
}

export default function AboutPage() {
	const [content, setContent] = useState<AboutContent | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchContent = async () => {
			const { data } = await supabase.from('about_content').select('*').single()

			if (data) {
				setContent(data)
			}
			setLoading(false)
		}

		fetchContent()
	}, [])

	if (loading) {
		return (
			<div className='min-h-screen pt-20'>
				{/* Hero Section Skeleton */}
				<div className='relative h-[70vh]'>
					<Skeleton className='absolute inset-0' />
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='text-center px-4'>
							<Skeleton className='h-16 w-48 mx-auto mb-6' />
							<Skeleton className='h-8 w-96 mx-auto' />
						</div>
					</div>
				</div>

				{/* Main Content Skeleton */}
				<div className='max-w-7xl mx-auto px-4 py-16'>
					<Skeleton className='w-32 h-10 mb-12' />

					<div className='grid md:grid-cols-2 gap-16 items-center'>
						<Skeleton className='aspect-[3/4] rounded-lg' />
						<div className='space-y-6'>
							<Skeleton className='h-10 w-48' />
							<div className='space-y-4'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />
							</div>
							<div className='grid grid-cols-3 gap-6 mt-12'>
								{Array.from({ length: 3 }).map((_, index) => (
									<div
										key={index}
										className='text-center'>
										<Skeleton className='w-8 h-8 mx-auto mb-3' />
										<Skeleton className='h-6 w-16 mx-auto mb-1' />
										<Skeleton className='h-4 w-24 mx-auto' />
									</div>
								))}
							</div>
						</div>
					</div>

					<div className='mt-24 text-center max-w-4xl mx-auto'>
						<Skeleton className='h-8 w-2/3 mx-auto mb-4' />
						<Skeleton className='h-4 w-32 mx-auto' />
					</div>
				</div>
			</div>
		)
	}

	if (!content) {
		return null
	}

	return (
		<div className='min-h-screen pt-20'>
			{/* Hero Section */}
			<div className='relative h-[70vh] overflow-hidden'>
				<Image
					src={content.hero_image}
					alt='Artist Studio'
					fill
					className='object-cover'
					priority
				/>
				<div className='absolute inset-0 bg-black bg-opacity-40' />
				<div className='absolute inset-0 flex items-center justify-center'>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className='text-center text-white px-4'>
						<h1 className='text-5xl md:text-7xl font-light mb-6'>
							{content.artist_name}
						</h1>
						<p className='text-xl md:text-2xl max-w-2xl mx-auto'>
							{content.hero_subtitle}
						</p>
					</motion.div>
				</div>
			</div>

			{/* Main Content */}
			<div className='max-w-7xl mx-auto px-4 py-16'>
				<Link
					href='/'
					className='inline-flex items-center text-gray-600 hover:text-black mb-12 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/80'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Gallery
				</Link>

				<div className='grid md:grid-cols-2 gap-16 items-center'>
					{/* Artist Image */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className='relative aspect-[3/4] rounded-lg overflow-hidden shadow-2xl'>
						<Image
							src={content.artist_image}
							alt={content.artist_name}
							fill
							className='object-cover'
						/>
					</motion.div>

					{/* Artist Bio */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className='space-y-6'>
						<h2 className='text-4xl font-light'>About the Artist</h2>
						<div className='prose max-w-none'>
							{content.bio_text.map((paragraph, index) => (
								<p
									key={index}
									className='text-lg text-gray-600'>
									{paragraph}
								</p>
							))}
						</div>

						{/* Achievements */}
					</motion.div>
				</div>

				{/* Quote Section */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.6 }}
					className='mt-24 text-center max-w-4xl mx-auto'>
					<blockquote className='text-2xl md:text-3xl font-light italic text-gray-700'>
						{content.quote}
					</blockquote>
					<cite className='block mt-4 text-gray-500'>
						— {content.quote_author}
					</cite>
				</motion.div>
			</div>
		</div>
	)
}
