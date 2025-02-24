'use client'

import { useState, useEffect, use } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
	Plus,
	Pencil,
	Trash2,
	X,
	Eye,
	EyeOff,
	ChevronLeft,
	ChevronRight,
	Image as ImageIcon,
	CrownIcon,
} from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { MuseumIcon } from '@/components/icons/museum_icon'
import { useToast } from '@/hooks/use-toast'
import { Description } from '@radix-ui/react-toast'
import Link from 'next/link'
import { Artwork, Museum, MuseumItem } from '@/lib/types'

/* const FeedBackComponent = ({ message, type }: FeedBackMessage) => {
	switch (type) {
		case 'success':
			return (
				<div
					className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4'
					role='alert'>
					<span className='block sm:inline'>{message}</span>
				</div>
			)
		case 'error':
			return (
				<div
					className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
					role='alert'>
					<span className='block sm:inline'>{message}</span>
				</div>
			)
		case 'warning':
			return (
				<div
					className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4'
					role='alert'>
					<span className='block sm:inline'>{message}</span>
				</div>
			)
		case 'info':
			return (
				<div
					className='bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4'
					role='alert'>
					<span className='block sm:inline'>{message}</span>
				</div>
			)
		default:
			return null
	}
} */

export function MuseumSection() {
	const [museums, setMuseums] = useState<Museum[]>([])
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [selectedMuseum, setSelectedMuseum] = useState<Museum | null>(null)
	const [formData, setFormData] = useState<Partial<Museum>>({})
	const [museumItems, setMuseumItems] = useState<MuseumItem[]>([])
	const [artworks, setArtworks] = useState<Artwork[]>([])
	const [isArtworkDialogOpen, setIsArtworkDialogOpen] = useState(false)
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
	const supabase = createClientComponentClient()
	const { toast } = useToast()
	/* 	const [feedbackMessage, setFeedbackMessage] =
		useState<FeedBackMessage | null>(null) */

	useEffect(() => {
		fetchMuseums()
		fetchArtworks()
	}, [])

	const fetchMuseums = async () => {
		const { data } = await supabase
			.from('museums')
			.select('*')
			.order('created_at', { ascending: false })

		if (data) {
			const sortedData = data.sort(
				(a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0)
			)
			setMuseums(sortedData)
		}
		setLoading(false)
	}

	const fetchArtworks = async () => {
		const { data } = await supabase
			.from('artworks')
			.select(
				'id, title, category, image_url, year, description, medium, dimensions, location'
			)

		if (data) {
			setArtworks(data)
		}
	}

	const fetchMuseumItems = async (itemIds: string[]) => {
		const { data } = await supabase
			.from('museum_items')
			.select('*')
			.in('id', itemIds)
			.order('index')

		if (data) {
			setMuseumItems(data)
		}
	}

	const createMuseumItems = async () => {
		const items = []
		for (let i = 0; i < 5; i++) {
			const { data } = await supabase
				.from('museum_items')
				.insert([
					{
						visible: true,
						artwork_id: null,
						index: i,
					},
				])
				.select()
				.single()

			if (data) {
				items.push(data)
			}
		}
		return items.map(item => item.id)
	}

	const showNotification = (
		title: string,
		description: string,
		variant?: 'destructive' | 'default'
	) => {
		toast({
			title,
			variant,
			description,
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (selectedMuseum) {
			const { error } = await supabase
				.from('museums')
				.update(formData)
				.eq('id', selectedMuseum.id)

			if (!error) {
				fetchMuseums()
				setIsEditing(false)
				setSelectedMuseum(null)
				showNotification('Museo', 'Museo actualizado correctamente.')
			} else {
				showNotification(
					'Error',
					'Error al actualizar el museo.',
					'destructive'
				)
			}
		} else {
			const museum_item_ids = await createMuseumItems()
			//hace por defecto visible false
			formData.visible = false
			const { data, error } = await supabase
				.from('museums')
				.insert([{ ...formData, museum_item_ids }])
				.select()
				.single()

			if (!error) {
				fetchMuseums()
				setIsEditing(false)
				showNotification('Museo', 'Museo creado correctamente.')
			} else {
				showNotification('Error', 'Error al crear el museo.', 'destructive')
			}
		}
	}

	const setPrincipal = async (id: string) => {
		const museum = museums.find(m => m.id === id)
		if (museum) {
			if (museum.principal) {
				await supabase.from('museums').update({ principal: false }).eq('id', id)
			} else {
				await supabase
					.from('museums')
					.update({ principal: false })
					.not('id', 'eq', id)
				showNotification('Museo', 'Museo principal actualizado correctamente.')
			}
			await supabase
				.from('museums')
				.update({ principal: !museum.principal })
				.eq('id', id)
			fetchMuseums()
		}
	}

	const handleDelete = async (id: string) => {
		if (confirm('Are you sure you want to delete this museum?')) {
			const museum = museums.find(m => m.id === id)
			if (museum) {
				// Delete associated museum items
				await supabase
					.from('museum_items')
					.delete()
					.in('id', museum.museum_item_ids)

				// Delete museum
				const { error } = await supabase.from('museums').delete().eq('id', id)

				if (!error) {
					fetchMuseums()
					showNotification('Museo', 'Museo eliminado correctamente.')
				}
			}
		}
	}

	const updateMuseumItem = async (
		itemId: string,
		updates: Partial<MuseumItem>
	) => {
		const { error } = await supabase
			.from('museum_items')
			.update(updates)
			.eq('id', itemId)

		if (!error) {
			fetchMuseumItems(selectedMuseum?.museum_item_ids || [])
		}
	}

	const updateMuseum = async (museumId: string, updates: Partial<Museum>) => {
		const { error } = await supabase
			.from('museums')
			.update(updates)
			.eq('id', museumId)

		if (!error) {
			fetchMuseums()
			showNotification('Museo', 'Museo actualizado correctamente.')
		}
	}

	const moveItem = async (itemId: string, direction: 'left' | 'right') => {
		const currentIndex = museumItems.findIndex(item => item.id === itemId)
		const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1

		if (newIndex >= 0 && newIndex < museumItems.length) {
			const updatedItems = [...museumItems]
			const temp = updatedItems[currentIndex].index
			updatedItems[currentIndex].index = updatedItems[newIndex].index
			updatedItems[newIndex].index = temp

			await Promise.all([
				updateMuseumItem(updatedItems[currentIndex].id, {
					index: updatedItems[currentIndex].index,
				}),
				updateMuseumItem(updatedItems[newIndex].id, {
					index: updatedItems[newIndex].index,
				}),
			])
		}
	}

	const handleArtworkSelect = async (artworkId: string) => {
		if (selectedItemId) {
			await updateMuseumItem(selectedItemId, { artwork_id: artworkId })
			setIsArtworkDialogOpen(false)
			setSelectedItemId(null)
		}
	}

	if (loading) {
		return (
			<div className='space-y-8'>
				<div className='flex justify-between items-center mb-6'>
					<Skeleton className='h-8 w-32' />
					<Skeleton className='h-10 w-24' />
				</div>
				<div className='flex w-full mt-4 items-center justify-center flex-wrap gap-8'>
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton
							key={`skeleton-${index}`}
							className='h-64 w-64'
						/>
					))}
				</div>
			</div>
		)
	}

	if (isEditing) {
		return (
			<>
				<Dialog
					open={isArtworkDialogOpen}
					onOpenChange={setIsArtworkDialogOpen}>
					<DialogContent
						aria-describedby='selecionar artwork'
						className='max-w-4xl'>
						<DialogHeader>
							<DialogTitle>Select Artwork</DialogTitle>
						</DialogHeader>
						<div className='mt-4'>
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
									className='mb-6'>
									<h3 className='text-lg font-medium mb-3'>{category}</h3>
									<div className='grid grid-cols-4 gap-4'>
										{categoryArtworks.map(artwork => (
											<button
												key={artwork.id}
												onClick={() => handleArtworkSelect(artwork.id)}
												className='relative aspect-square bg-gray-100 rounded-lg overflow-hidden group'>
												<Image
													src={artwork.image_url}
													alt={artwork.title}
													fill
													className='object-cover'
												/>
												<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300'>
													<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'>
														<span className='text-white text-sm font-medium'>
															{artwork.title}
														</span>
													</div>
												</div>
											</button>
										))}
									</div>
								</div>
							))}
						</div>
					</DialogContent>
				</Dialog>
				<div className='bg-white rounded-lg shadow-sm p-6'>
					<div className='flex justify-between items-center mb-6'>
						<h3 className='text-xl font-light'>
							{selectedMuseum ? 'Editar Museo' : 'Crear Museo'}
						</h3>
						<button
							onClick={() => {
								setIsEditing(false)
								setSelectedMuseum(null)
								setMuseumItems([])
							}}
							className='text-gray-500 hover:text-black'>
							<X className='w-5 h-5' />
						</button>
					</div>

					<form
						onSubmit={handleSubmit}
						className='space-y-6'>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									Nombre del Museo
								</label>
								<input
									type='text'
									value={formData.title || ''}
									onChange={e =>
										setFormData({ ...formData, title: e.target.value })
									}
									className='w-full px-3 py-2 border rounded-lg'
									required
								/>
							</div>
						</div>

						{selectedMuseum && (
							<div className='space-y-4'>
								<h4 className='text-lg font-medium'>Museum Items</h4>
								<div className='grid grid-cols-5 gap-4'>
									{museumItems.map((item, index) => {
										const artwork = artworks.find(a => a.id === item.artwork_id)
										return (
											<div
												key={item.id}
												className={cn(
													'relative aspect-square bg-gray-100 rounded-lg overflow-hidden group',
													{
														'opacity-25': !item.visible,
													}
												)}>
												{artwork ? (
													<Image
														src={artwork.image_url}
														alt={artwork.title}
														fill
														className='object-contain'
													/>
												) : (
													<div className='absolute inset-0 flex items-center justify-center'>
														<ImageIcon className='w-8 h-8 text-gray-400' />
													</div>
												)}
												<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300'>
													<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300'>
														<div className='flex space-x-2'>
															{index > 0 && (
																<button
																	type='button'
																	onClick={() => moveItem(item.id, 'left')}
																	className='p-2 bg-white rounded-full hover:bg-gray-100'>
																	<ChevronLeft className='w-4 h-4' />
																</button>
															)}
															<button
																type='button'
																onClick={() => {
																	setSelectedItemId(item.id)
																	setIsArtworkDialogOpen(true)
																}}
																className='p-2 bg-white rounded-full hover:bg-gray-100'>
																<ImageIcon className='w-4 h-4' />
															</button>
															<button
																type='button'
																onClick={() =>
																	updateMuseumItem(item.id, {
																		visible: !item.visible,
																	})
																}
																className='p-2 bg-white rounded-full hover:bg-gray-100'>
																{item.visible ? (
																	<Eye className='w-4 h-4' />
																) : (
																	<EyeOff className='w-4 h-4' />
																)}
															</button>
															{index < museumItems.length - 1 && (
																<button
																	type='button'
																	onClick={() => moveItem(item.id, 'right')}
																	className='p-2 bg-white rounded-full hover:bg-gray-100'>
																	<ChevronRight className='w-4 h-4' />
																</button>
															)}
														</div>
													</div>
												</div>
											</div>
										)
									})}
								</div>
							</div>
						)}

						<div className='flex justify-end'>
							<button
								type='submit'
								className='bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800'>
								{selectedMuseum ? 'Actualizar' : 'Crear'}
							</button>
						</div>
					</form>
				</div>
			</>
		)
	}

	return (
		<>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-2xl font-light'>Administrar Museos</h2>
				<button
					onClick={() => {
						setFormData({})
						setIsEditing(true)
					}}
					className='bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2'>
					<Plus className='w-5 h-5' />
					<span>Añadir</span>
				</button>
			</div>

			<div className='flex w-full mt-4 items-center justify-center flex-wrap gap-8'>
				{museums.map(museum => (
					<div
						key={museum.id}
						className={cn(
							'flex flex-col items-center rounded-lg shadow-sm p-2',
							{
								'opacity-50': !museum.visible,
							},
							museum.principal ? 'bg-amber-50' : 'bg-white'
						)}>
						<h3 className='text-lg font-medium truncate'>{museum.title}</h3>
						<Link href={`/museum?id=${museum.id}`}>
							<MuseumIcon className='w-60 h-60 hover:scale-110 transition-all ease-in cursor-alias' />
						</Link>
						<div className='flex w-full justify-between items-center'>
							{museum.principal ? (
								<CrownIcon className='text-amber-500 ml-2' />
							) : (
								museum.visible && (
									<button
										onClick={() => {
											if (museum.principal) return
											setPrincipal(museum.id)
										}}
										className='p-2 text-gray-500 '>
										<CrownIcon
											className='hover:text-amber-500'
											strokeWidth={0.5}
										/>
									</button>
								)
							)}

							<div className='flex space-x-2'>
								{museum.principal == false && (
									<button
										onClick={() => {
											if (museum.principal) return
											updateMuseum(museum.id, { visible: !museum.visible })
										}}
										className='p-2 text-gray-500 hover:text-black'>
										{museum.visible ? <Eye /> : <EyeOff />}
									</button>
								)}
								<button
									onClick={() => {
										setSelectedMuseum(museum)
										setFormData(museum)
										setIsEditing(true)
										fetchMuseumItems(museum.museum_item_ids)
									}}
									className='p-2 text-gray-500 hover:text-black'>
									<Pencil className='w-5 h-5' />
								</button>
								{!museum.principal && (
									<button
										onClick={() => handleDelete(museum.id)}
										className='p-2 text-gray-500 hover:text-red-500'>
										<Trash2 className='w-5 h-5' />
									</button>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</>
	)
}
