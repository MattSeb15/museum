'use client'
import SimpleDragDrop from '@/components/custom/test'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useSite } from '@/lib/store/site-context'
import { supabase } from '@/lib/supabase/client'
import { Artwork } from '@/lib/types'
import { cn, hexColorToRGB } from '@/lib/utils'
import { EraserIcon, ImageIcon, InfoIcon, MoveIcon } from 'lucide-react'
import Image from 'next/image'
import React, { use, useEffect, useState } from 'react'


const reorder = (list: any[], startIndex: number, endIndex: number) => {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)

	return result
}

export function MuseumSection() {
	const [paintings, setPaintings] = useState(
		[...Array(5)].map((_, index) => ({
			id: `painting-${index + 1}`,
			index: index + 1,
		}))
	)

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return

		const items = reorder(
			paintings,
			result.source.index,
			result.destination.index
		)
		setPaintings(items)
	}

	return (
		<section className='museum-section'>
			<h2>Museum Section</h2>
			<SimpleDragDrop />
			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable
					droppableId='paintings'
					direction='horizontal'>
					{provided => (
						<div
							className='flex flex-wrap gap-8'
							{...provided.droppableProps}
							ref={provided.innerRef}>
							{paintings.map((painting, index) => (
								<Draggable
									key={painting.id}
									draggableId={painting.id}
									index={index}>
									{provided => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											className='relative p-4 border border-gray-300 rounded-md'>
											<PaintingTest index={painting.index} />
											<div className='absolute bottom-0 right-0 p-2 cursor-pointer'>
												<MoveIcon className='w-5 h-5 text-gray-500' />
											</div>
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</section>
	)
}
const PaintingTest: React.FC<{ index: number }> = ({ index }) => {
	return (
		<div className='flex items-center justify-center w-32 h-32 bg-blue-200 rounded-md'>
			Cuadro {index}
		</div>
	)
}

const Painting: React.FC<{ artwork?: Artwork; index: number }> = ({
	artwork,
	index,
}) => {
	const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)

	const handleAddArtwork = () => {
		if (selectedArtwork) {
			//añadir a la base de datos
			console.log('Añadiendo cuadro', selectedArtwork)
		}
	}

	return artwork ? (
		<div></div>
	) : (
		<PaintingContent
			selectedArtwork={selectedArtwork}
			setSelectedArtwork={setSelectedArtwork}
			index={index}
			handleAddArtwork={handleAddArtwork}
			title={!selectedArtwork ? 'Selecciona una obra' : selectedArtwork.title}
			description={
				!selectedArtwork
					? 'Aqui podras ver la descripcion del cuadro'
					: selectedArtwork.description
			}
		/>
	)
}
const PaintingContent: React.FC<{
	selectedArtwork: Artwork | null
	setSelectedArtwork: (artwork: Artwork | null) => void
	index: number
	handleAddArtwork: () => void
	title: string
	description: string
}> = ({
	selectedArtwork,
	setSelectedArtwork,
	index,
	handleAddArtwork,
	description,
	title,
}) => {
	const [tempArtwork, setTempArtwork] = useState<Artwork | null>(null)

	return (
		<div className='flex w-full items-center justify-center'>
			<div className='flex h-full w-[220px] flex-col items-center text-center hover:scale-105 bg-white px-2 py-1 rounded-md'>
				<h2 className='text-md font-semibold'>Cuadro {index}</h2>
				<div className='flex flex-col items-center bg-white rounded-md'>
					<AlertDialog>
						<AlertDialogTrigger>
							{selectedArtwork ? (
								<Image
									src={selectedArtwork.image_url}
									alt={selectedArtwork.title}
									width={100}
									height={100}
									className='w-28 h-40 object-contain'
								/>
							) : (
								<div className='w-28 h-40 bg-gray-300 animate-pulse hover:bg-gray-400/90 flex items-center justify-center'>
									<ImageIcon className='w-16 h-16' />
								</div>
							)}
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogTitle className='text-md flex items-center justify-between'>
								Lista de obras - Selecciona una{' '}
								<button
									onClick={() => setTempArtwork(null)}
									className='text-gray-500'>
									<EraserIcon className='w-5 h-4' />
								</button>
							</AlertDialogTitle>
							<AlertDialogDescription></AlertDialogDescription>
							<SelectPaintingSection
								selectedArtwork={tempArtwork}
								setSelectedArtwork={setTempArtwork}
							/>

							<div className='flex gap-3 mt-4 justify-end'>
								<AlertDialogCancel
									onClick={() => {
										setTempArtwork(selectedArtwork)
									}}>
									Cancelar
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => {
										setSelectedArtwork(tempArtwork)
										handleAddArtwork()
									}}>
									Guardar
								</AlertDialogAction>
							</div>
						</AlertDialogContent>
					</AlertDialog>
					<div className='flex justify-between items-center w-full gap-2 mt-2'>
						<h3 className='text-sm truncate font-semibold'>{title}</h3>
						<div className='relative group'>
							<span className='material-icons cursor-pointer'>
								<InfoIcon className='w-4 h-4' />
							</span>
							<div className='absolute bottom-full mb-2 hidden z-50 group-hover:block bg-white p-2 rounded-md shadow-lg'>
								<p className='text-sm text-start min-w-fit w-72'>
									<span className='text-md text-start font-semibold'>
										{title}
									</span>
									<div className='w-full h-0.5 bg-slate-50'></div>
									<span className='text-gray-700'>{description}</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

const SelectPaintingSection: React.FC<{
	setSelectedArtwork: (artwork: Artwork) => void
	selectedArtwork: Artwork | null
}> = ({ setSelectedArtwork, selectedArtwork }) => {
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
		<div className='flex flex-col items-center text-center'>
			{/* Categories */}
			<div
				style={{
					backgroundColor: bgColor || 'white',
					color: config?.text_color || 'black',
				}}
				className='bg-white/80 w-full items-start py-4 border-b'>
				<div className='w- px-2'>
					<div className='flex overflow-x-auto space-x-2 pb-2 scrollbar-hide'>
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

			{/* Artwork Grid */}
			<div className='px-4 py-8'>
				<div className='justify-items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8'>
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
									artwork={artwork}
									index={index}
									selected={selectedArtwork?.id === artwork.id}
									setSelectedArtwork={setSelectedArtwork}
								/>
						  ))}
				</div>
			</div>
		</div>
	)
}

const ArtworkCard: React.FC<{
	artwork: Artwork
	index: number
	setSelectedArtwork: (artwork: Artwork) => void
	selected: boolean
}> = ({ artwork, index, setSelectedArtwork, selected }) => {
	return (
		<div
			onClick={() => setSelectedArtwork(artwork)}
			className={cn(
				'flex flex-col hover:scale-110 cursor-pointer transition-all ease-in items-center bg-white hover:bg-gray-200 px-4 py-2 rounded-md shadow-md',
				{
					'border-2 border-slate-500': selected,
				}
			)}>
			<Image
				src={artwork.image_url}
				alt={artwork.title}
				width={300}
				height={100}
				className='w-auto h-20 object-contain'
			/>
			<div className='flex justify-between items-center w-full gap-2 mt-2'>
				<h3 className='text-sm truncate'>{artwork.title}</h3>
				<div className='relative group'>
					<span className='material-icons cursor-pointer'>
						<InfoIcon className='w-4 h-4' />
					</span>
					<div className='absolute bottom-full mb-2 hidden z-50 group-hover:block bg-white p-2 rounded-md shadow-lg'>
						<p className='text-sm text-start min-w-fit w-72'>
							<span className='text-md text-start'>{artwork.title}</span>
							<div className='w-full h-0.5 bg-slate-50'></div>
							<span className='text-gray-700'>{artwork.description}</span>
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
