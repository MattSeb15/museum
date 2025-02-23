'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import SelectImage from '@/components/custom/select-image'
import { Switch } from '@/components/ui/switch'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/firebase'
import { v4 } from 'uuid'

type Artwork = {
	id: string
	title: string
	category: string
	image_url: string
	year: string
	description: string
	medium: string
	dimensions: string
	location: string
}

export function ArtworksSection() {
	const [isImageUrl, setIsImageUrl] = useState(false)
	const [error, setError] = useState('')
	const [file, setFile] = useState<File | null>(null)
	const [artworks, setArtworks] = useState<Artwork[]>([])
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
	const [formData, setFormData] = useState<Partial<Artwork>>({})
	const supabase = createClientComponentClient()

	useEffect(() => {
		fetchArtworks()
	}, [])

	const fetchArtworks = async () => {
		const { data } = await supabase
			.from('artworks')
			.select('*')
			.order('created_at', { ascending: false })

		if (data) {
			setArtworks(data)
		}
		setLoading(false)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (selectedArtwork) {
			// Update existing artwork
			const { error } = await supabase
				.from('artworks')
				.update(formData)
				.eq('id', selectedArtwork.id)

			if (!error) {
				fetchArtworks()
				setIsEditing(false)
				setSelectedArtwork(null)
			}
		} else {
			setLoading(true)
			if (
				!formData.title ||
				!formData.category ||
				!formData.year ||
				!formData.description ||
				!formData.medium ||
				!formData.dimensions ||
				!formData.location
			) {
				setError('Por favor, rellena todos los campos.')
				return
			}

			if (!isImageUrl && !file) {
				setError('Por favor, selecciona una imagen.')
				return
			}
			//If mode is not URL, upload image to storage
			if (!isImageUrl) {
				const storageRef = ref(storage, `art/${v4()}`)

				try {
					if (file) {
						const snapshot = await uploadBytes(storageRef, file)
						const url = await getDownloadURL(snapshot.ref)
						const updatedFormData = { ...formData, image_url: url }
						setFormData(updatedFormData)
						console.log(updatedFormData)
						const { error } = await supabase
							.from('artworks')
							.insert([updatedFormData])
						setError('')
						if (!error) {
							fetchArtworks()
							setIsEditing(false)
						}
					} else {
						setError('Por favor, selecciona un archivo.')
						return
					}

					setLoading(false)
				} catch (error) {
					setError((error as Error).message)
				}
			} else {
				// Create new artwork
				if (isImageUrl && !formData.image_url) {
					setError('Por favor, introduce una URL de imagen.')
					return
				}
				const { error } = await supabase.from('artworks').insert([formData])

				if (!error) {
					fetchArtworks()
					setIsEditing(false)
				}
				setLoading(false)
			}
		}
	}

	const handleDelete = async (id: string) => {
		if (confirm('Are you sure you want to delete this artwork?')) {
			const { error } = await supabase.from('artworks').delete().eq('id', id)

			if (!error) {
				fetchArtworks()
			}
		}
	}

	if (loading) {
		return (
			<div className='space-y-4'>
				<div className='flex justify-between items-center mb-6'>
					<Skeleton className='h-8 w-32' />
					<Skeleton className='h-10 w-24' />
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={i}
							className='h-48 w-full'
						/>
					))}
				</div>
			</div>
		)
	}

	if (isEditing) {
		return (
			<div className='bg-white rounded-lg shadow-sm p-6'>
				<div className='flex justify-between items-center mb-6'>
					<h3 className='text-xl font-light'>
						{selectedArtwork ? 'Edit Artwork' : 'Add New Artwork'}
					</h3>
					<button
						onClick={() => {
							setIsEditing(false)
							setSelectedArtwork(null)
						}}
						className='text-gray-500 hover:text-black'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='flex flex-col w-full items-center'>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Imagen
						</label>

						<div className='flex items-center space-x-4 mt-4'>
							<label className='block text-sm font-medium text-gray-700'>
								{isImageUrl ? 'Modo: URL' : 'Modo: Subir'}
							</label>
							<Switch
								checked={isImageUrl}
								onCheckedChange={() => {
									formData.image_url =
										'https://placehold.jp/b0b0b0/ffffff/150x150.png?text=ImageUrl'
									setIsImageUrl(!isImageUrl)
								}}
							/>
						</div>

						{isImageUrl ? (
							<div>
								<div className='mt-4'>
									<label className='block text-sm font-medium text-gray-700 mb-1'>
										Image Preview
									</label>
									<div className='relative h-52 w-52'>
										<Image
											src={
												formData.image_url ||
												'https://placehold.jp/b0b0b0/ffffff/150x150.png?text=ImageUrl'
											}
											alt='Image Preview'
											fill
											className='object-cover rounded-lg border'
										/>
									</div>
								</div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>
									URL de la imagen
								</label>
								<Input
									type='url'
									placeholder='https://example.com/image.jpg'
									value={
										formData.image_url ||
										'https://placehold.jp/b0b0b0/ffffff/150x150.png?text=ImageUrl'
									}
									onChange={e =>
										setFormData({ ...formData, image_url: e.target.value })
									}
									className='w-full px-3 py-2 border rounded-lg'
									required
								/>
							</div>
						) : (
							<div className='mt-4'>
								<SelectImage
									onImageSelect={image => {
										if (image) {
											console.log(image)
											setFile(image as File)
										}
									}}
								/>
							</div>
						)}
					</div>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Título
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
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Categoría
							</label>
							<input
								type='text'
								value={formData.category || ''}
								onChange={e =>
									setFormData({ ...formData, category: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Fecha o Año
							</label>
							<input
								type='text'
								value={formData.year || ''}
								onChange={e =>
									setFormData({ ...formData, year: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Descripción
						</label>
						<textarea
							value={formData.description || ''}
							onChange={e =>
								setFormData({ ...formData, description: e.target.value })
							}
							className='w-full px-3 py-2 border rounded-lg'
							rows={4}
							required
						/>
					</div>

					<div className='grid grid-cols-3 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Técnica
							</label>
							<input
								type='text'
								value={formData.medium || ''}
								onChange={e =>
									setFormData({ ...formData, medium: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Dimensiones
							</label>
							<input
								type='text'
								value={formData.dimensions || ''}
								onChange={e =>
									setFormData({ ...formData, dimensions: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Lugar
							</label>
							<input
								type='text'
								value={formData.location || ''}
								onChange={e =>
									setFormData({ ...formData, location: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
					</div>
					<p className='text-red-500 text-sm'>{error}</p>
					<div className='flex justify-end'>
						<button
							type='submit'
							className='bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800'>
							{selectedArtwork ? 'Update' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		)
	}

	return (
		<div>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-2xl font-light'>Manage Artworks</h2>
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

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{artworks.map(artwork => (
					<div
						key={artwork.id}
						className='bg-white rounded-lg shadow-sm overflow-hidden group'>
						<div className='relative h-48'>
							<Image
								src={artwork.image_url}
								alt={artwork.title}
								fill
								className='object-cover'
							/>
							<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300'>
								<div className='absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300'>
									<button
										onClick={() => {
											setSelectedArtwork(artwork)
											setFormData(artwork)
											setIsEditing(true)
										}}
										className='p-2 bg-white rounded-full hover:bg-gray-100'>
										<Pencil className='w-4 h-4' />
									</button>
									<button
										onClick={() => handleDelete(artwork.id)}
										className='p-2 bg-white rounded-full hover:bg-gray-100 hover:text-red-500'>
										<Trash2 className='w-4 h-4' />
									</button>
								</div>
							</div>
						</div>
						<div className='p-4'>
							<h3 className='text-lg font-medium mb-1'>{artwork.title}</h3>
							<div className='flex justify-between text-sm text-gray-500'>
								<span>{artwork.category}</span>
								<span>{artwork.year}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
