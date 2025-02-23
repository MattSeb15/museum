'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useCart } from '@/lib/store/cart-context'
import { Skeleton } from '@/components/ui/skeleton'

type Product = {
	id: string
	name: string
	category: string
	price: number
	mockup_image: string
}

type Artwork = {
	id: string
	title: string
	category: string
	image_url: string
	year: string
}

export default function ShopPage() {
	const [categories, setCategories] = useState<
		{ name: string; products: Product[] }[]
	>([])
	const [artworks, setArtworks] = useState<Artwork[]>([])
	const [loading, setLoading] = useState(true)
	const [selectedCategory, setSelectedCategory] = useState<{
		name: string
		products: Product[]
	} | null>(null)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
	const { addItem } = useCart()

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true)

			const [productsResponse, artworksResponse] = await Promise.all([
				supabase.from('products').select('*'),
				supabase.from('artworks').select('*'),
			])

			if (productsResponse.data) {
				// Group products by category
				const groupedProducts = productsResponse.data.reduce((acc, product) => {
					const category: { name: string; products: Product[] } | undefined =
						acc.find(
							(c: { name: string; products: Product[] }) =>
								c.name === product.category
						)
					if (category) {
						category.products.push(product)
					} else {
						acc.push({ name: product.category, products: [product] })
					}
					return acc
				}, [] as { name: string; products: Product[] }[])

				setCategories(groupedProducts)
				setSelectedCategory(groupedProducts[0])
				setSelectedProduct(groupedProducts[0]?.products[0])
			}

			if (artworksResponse.data) {
				setArtworks(artworksResponse.data)
				setSelectedArtwork(artworksResponse.data[0])
			}

			setLoading(false)
		}

		fetchData()
	}, [])

	const handleAddToCart = () => {
		if (selectedProduct && selectedArtwork) {
			addItem({
				productId: selectedProduct.id,
				productName: selectedProduct.name,
				artworkId: selectedArtwork.id,
				artworkTitle: selectedArtwork.title,
				price: selectedProduct.price,
				image: selectedArtwork.image_url,
				mockupImage: selectedProduct.mockup_image,
			})
		}
	}

	if (loading) {
		return (
			<div className='min-h-screen pt-20 bg-gradient-to-b from-white to-gray-50'>
				<div className='max-w-7xl mx-auto px-4 py-8'>
					<Skeleton className='w-32 h-10 mb-8' />

					{/* Categories Navigation Skeleton */}
					<div className='mb-8 border-b'>
						<div className='flex space-x-8'>
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton
									key={i}
									className='w-24 h-8 mb-4'
								/>
							))}
						</div>
					</div>

					<div className='grid grid-cols-12 gap-8'>
						{/* Main Content Skeleton */}
						<div className='col-span-12 lg:col-span-7 space-y-8'>
							<Skeleton className='aspect-square w-full rounded-xl' />
							<div className='grid grid-cols-3 gap-4'>
								{Array.from({ length: 3 }).map((_, i) => (
									<Skeleton
										key={i}
										className='aspect-square rounded-lg'
									/>
								))}
							</div>
						</div>

						{/* Right Panel Skeleton */}
						<div className='col-span-12 lg:col-span-5'>
							<div className='bg-white rounded-xl shadow-lg p-4'>
								<Skeleton className='w-32 h-6 mb-4' />
								<div className='space-y-4'>
									{Array.from({ length: 4 }).map((_, i) => (
										<div
											key={i}
											className='flex items-center space-x-3'>
											<Skeleton className='w-16 h-16 rounded-lg' />
											<div className='flex-1'>
												<Skeleton className='w-24 h-4 mb-2' />
												<Skeleton className='w-16 h-4' />
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!selectedCategory || !selectedProduct || !selectedArtwork) {
		return null
	}

	return (
		<div className='min-h-screen pt-20 bg-gradient-to-b from-white to-gray-50'>
			<div className='max-w-7xl mx-auto px-4 py-8'>
				<Link
					href='/'
					className='inline-flex items-center text-gray-600 hover:text-black mb-8 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-white/80'>
					<ArrowLeft className='h-4 w-4 mr-2' />
					Back to Gallery
				</Link>

				{/* Categories Navigation */}
				<div className='mb-8 border-b'>
					<div className='flex space-x-8'>
						{categories.map(category => (
							<button
								key={category.name}
								onClick={() => {
									setSelectedCategory(category)
									setSelectedProduct(category.products[0])
								}}
								className={`pb-4 px-4 relative ${
									selectedCategory.name === category.name
										? 'text-black'
										: 'text-gray-500 hover:text-black'
								}`}>
								{category.name}
								{selectedCategory.name === category.name && (
									<motion.div
										layoutId='activeCategory'
										className='absolute bottom-0 left-0 right-0 h-0.5 bg-black'
									/>
								)}
							</button>
						))}
					</div>
				</div>

				<div className='grid grid-cols-12 gap-8'>
					{/* Main Content */}
					<div className='col-span-12 lg:col-span-7 space-y-8'>
						{/* Product Preview */}
						<div className='relative aspect-square bg-white rounded-xl overflow-hidden shadow-xl'>
							<Image
								src={selectedProduct.mockup_image}
								alt={selectedProduct.name}
								fill
								className='object-cover'
							/>
							<div className='absolute inset-0 bg-black/10' />
							<div className='absolute inset-0 flex items-center justify-center'>
								<Image
									src={selectedArtwork.image_url}
									alt={selectedArtwork.title}
									width={200}
									height={200}
									className='object-contain max-w-[60%] max-h-[60%]'
								/>
							</div>
						</div>

						{/* Product Selection */}
						<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
							{selectedCategory.products.map(product => (
								<motion.button
									key={product.id}
									onClick={() => setSelectedProduct(product)}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className={`relative aspect-square rounded-lg overflow-hidden ${
										selectedProduct.id === product.id
											? 'ring-2 ring-black'
											: 'ring-1 ring-gray-200'
									}`}>
									<Image
										src={product.mockup_image}
										alt={product.name}
										fill
										className='object-cover'
									/>
									<div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
										<span className='text-white font-medium'>
											{product.name}
										</span>
									</div>
								</motion.button>
							))}
						</div>

						{/* Product Details and Add to Cart */}
						<div className='bg-white p-6 rounded-xl shadow-lg'>
							<h1 className='text-2xl font-light mb-2'>
								{selectedProduct.name} with {selectedArtwork.title}
							</h1>
							<p className='text-gray-600 mb-4'>
								Custom design featuring your selected artwork
							</p>

							<div className='flex justify-between items-center'>
								<span className='text-2xl'>${selectedProduct.price}</span>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={handleAddToCart}
									className='bg-black text-white px-8 py-3 rounded-full inline-flex items-center space-x-2 hover:bg-gray-800 transition-colors'>
									<span>Add to Cart</span>
								</motion.button>
							</div>
						</div>
					</div>

					{/* Right Panel - Artwork Selection */}
					<div className='col-span-12 lg:col-span-5'>
						<div className='bg-white rounded-xl shadow-lg overflow-hidden sticky top-24'>
							<div className='p-4 border-b'>
								<h2 className='text-xl font-light'>Select Artwork</h2>
							</div>
							<div className='overflow-y-auto max-h-[calc(100vh-200px)]'>
								{Object.entries(
									artworks.reduce((acc, artwork) => {
										const category = artwork.category
										if (!acc[category]) {
											acc[category] = []
										}
										acc[category].push(artwork)
										return acc
									}, {} as Record<string, Artwork[]>)
								).map(([category, categoryArtworks]) => (
									<div
										key={category}
										className='p-4 border-b last:border-b-0'>
										<h3 className='text-sm font-medium text-gray-500 mb-3'>
											{category}
										</h3>
										<div className='space-y-3'>
											{categoryArtworks.map(artwork => (
												<motion.button
													key={artwork.id}
													onClick={() => setSelectedArtwork(artwork)}
													className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
														selectedArtwork.id === artwork.id
															? 'bg-black/5'
															: 'hover:bg-black/5'
													}`}>
													<div className='relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0'>
														<Image
															src={artwork.image_url}
															alt={artwork.title}
															fill
															className='object-cover'
														/>
													</div>
													<div className='flex-1 text-left'>
														<h4 className='font-medium text-sm'>
															{artwork.title}
														</h4>
														<p className='text-sm text-gray-500'>
															{artwork.year}
														</p>
													</div>
													{selectedArtwork.id === artwork.id && (
														<div className='w-2 h-2 rounded-full bg-black flex-shrink-0' />
													)}
												</motion.button>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
