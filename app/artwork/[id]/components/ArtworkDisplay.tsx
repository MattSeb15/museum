'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { Artwork } from '@/lib/types'

export function ArtworkDisplay({ artwork }: { artwork: Artwork }) {
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [showLens, setShowLens] = useState(false)
	const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
	const imageRef = useRef<HTMLDivElement>(null)
	const ZOOM_LEVEL = 2.5
	const LENS_SIZE = 150

	useEffect(() => {
		const updateImageSize = () => {
			if (imageRef.current) {
				const rect = imageRef.current.getBoundingClientRect()
				setImageSize({
					width: rect.width,
					height: rect.height,
				})
			}
		}

		updateImageSize()
		window.addEventListener('resize', updateImageSize)
		return () => window.removeEventListener('resize', updateImageSize)
	}, [])

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (imageRef.current) {
			const rect = imageRef.current.getBoundingClientRect()

			const x = e.clientX - rect.left
			const y = e.clientY - rect.top

			const lensLeft = Math.max(
				0,
				Math.min(x - LENS_SIZE / 2, rect.width - LENS_SIZE)
			)
			const lensTop = Math.max(
				0,
				Math.min(y - LENS_SIZE / 2, rect.height - LENS_SIZE)
			)

			const lensCenter = {
				x: lensLeft + LENS_SIZE / 2,
				y: lensTop + LENS_SIZE / 2,
			}

			const zoomX = (lensCenter.x / rect.width) * 100
			const zoomY = (lensCenter.y / rect.height) * 100

			setPosition({
				x: lensLeft,
				y: lensTop,
				zoomX,
				zoomY,
			} as any)
		}
	}

	return (
		<div
			className='min-h-screen pt-20'
			style={{
				background: `
          linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.5)),
          url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E"),
          linear-gradient(120deg, #f5f5f5, #ffffff, #f0f0f0)
        `,
				backgroundBlendMode: 'overlay, multiply, normal',
				backgroundSize: '100px 100px, 100px 100px, 100% 100%',
				backgroundAttachment: 'fixed',
			}}>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				<Link
					href='/'
					className='inline-flex items-center text-gray-600 hover:text-black mb-8 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/80'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Gallery
				</Link>

				<div className='grid md:grid-cols-2 gap-12'>
					{/* Artwork Image with Zoom Effect */}
					<div
						className='relative aspect-[4/5] bg-white rounded-lg overflow-hidden'
						style={{
							boxShadow:
								'0 50px 100px -20px rgba(0,0,0,0.15), 0 30px 60px -30px rgba(0,0,0,0.2)',
						}}>
						{/* Main Image Container */}
						<div
							ref={imageRef}
							className='relative h-full cursor-zoom-in'
							onMouseMove={handleMouseMove}
							onMouseEnter={() => setShowLens(true)}
							onMouseLeave={() => setShowLens(false)}>
							<Image
								src={artwork.image_url}
								alt={artwork.title}
								fill
								className='object-cover'
								quality={100}
								priority
							/>

							{/* Magnifying Glass Icon Indicator */}
							<div className='absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg'>
								<Search className='w-5 h-5 text-gray-600' />
							</div>

							{/* Zoom Lens */}
							{showLens && imageSize.width > 0 && (
								<>
									{/* Lens Border */}
									<div
										className='absolute border-2 border-white rounded-lg shadow-lg pointer-events-none'
										style={{
											width: `${LENS_SIZE}px`,
											height: `${LENS_SIZE}px`,
											left: `${position.x}px`,
											top: `${position.y}px`,
										}}
									/>

									{/* Zoomed Image */}
									<div
										className='absolute overflow-hidden rounded-lg pointer-events-none'
										style={{
											width: `${LENS_SIZE}px`,
											height: `${LENS_SIZE}px`,
											left: `${position.x}px`,
											top: `${position.y}px`,
											boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
										}}>
										<div
											className='absolute'
											style={{
												width: `${imageSize.width * ZOOM_LEVEL}px`,
												height: `${imageSize.height * ZOOM_LEVEL}px`,
												left: `-${position.x * ZOOM_LEVEL}px`,
												top: `-${position.y * ZOOM_LEVEL}px`,
											}}>
											<Image
												src={artwork.image_url}
												alt={artwork.title}
												fill
												className='object-cover'
												quality={100}
											/>
										</div>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Artwork Information */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className='space-y-6 bg-white/70 backdrop-blur-sm p-8 rounded-lg'>
						<div>
							<h1 className='text-4xl font-light mb-2'>{artwork.title}</h1>
							<p className='text-gray-600'>{artwork.year}</p>
						</div>

						<div className='prose max-w-none'>
							<p className='text-gray-600'>{artwork.description}</p>
						</div>

						<div className='space-y-4 border-t border-gray-200/50 pt-6'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<h3 className='text-sm text-gray-500'>Categoría</h3>
									<p className='mt-1'>{artwork.category}</p>
								</div>
								<div>
									<h3 className='text-sm text-gray-500'>Técnica</h3>
									<p className='mt-1'>{artwork.medium}</p>
								</div>
								<div>
									<h3 className='text-sm text-gray-500'>Dimensiones</h3>
									<p className='mt-1'>{artwork.dimensions}</p>
								</div>
								<div>
									<h3 className='text-sm text-gray-500'>Lugar</h3>
									<p className='mt-1'>{artwork.location}</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	)
}
