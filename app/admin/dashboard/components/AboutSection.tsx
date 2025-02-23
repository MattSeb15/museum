'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Save, X } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'

type AboutContent = {
	id: string
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

export function AboutSection() {
	const [content, setContent] = useState<AboutContent | null>(null)
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState<Partial<AboutContent>>({})
	const supabase = createClientComponentClient()

	useEffect(() => {
		fetchContent()
	}, [])

	const fetchContent = async () => {
		const { data } = await supabase.from('about_content').select('*').single()

		if (data) {
			setContent(data)
			setFormData(data)
		}
		setLoading(false)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (content) {
			const { error } = await supabase
				.from('about_content')
				.update(formData)
				.eq('id', content.id)

			if (!error) {
				fetchContent()
				setIsEditing(false)
			}
		} else {
			const { error } = await supabase.from('about_content').insert([formData])

			if (!error) {
				fetchContent()
				setIsEditing(false)
			}
		}
	}

	if (loading) {
		return (
			<div className='space-y-8'>
				<div className='flex justify-between items-center mb-6'>
					<Skeleton className='h-8 w-32' />
					<Skeleton className='h-10 w-24' />
				</div>
				<Skeleton className='h-64 w-full' />
				<div className='space-y-4'>
					<Skeleton className='h-8 w-48' />
					<Skeleton className='h-32 w-full' />
				</div>
			</div>
		)
	}

	if (isEditing) {
		return (
			<div className='bg-white rounded-lg shadow-sm p-6'>
				<div className='flex justify-between items-center mb-6'>
					<h3 className='text-xl font-light'>Edit About Content</h3>
					<button
						onClick={() => setIsEditing(false)}
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
								Artist Name
							</label>
							<input
								type='text'
								value={formData.artist_name || ''}
								onChange={e =>
									setFormData({ ...formData, artist_name: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Hero Subtitle
							</label>
							<input
								type='text'
								value={formData.hero_subtitle || ''}
								onChange={e =>
									setFormData({ ...formData, hero_subtitle: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Hero Image URL
							</label>
							<input
								type='url'
								value={formData.hero_image || ''}
								onChange={e =>
									setFormData({ ...formData, hero_image: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Artist Image URL
							</label>
							<input
								type='url'
								value={formData.artist_image || ''}
								onChange={e =>
									setFormData({ ...formData, artist_image: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Bio Text (one paragraph per line)
						</label>
						<textarea
							value={formData.bio_text?.join('\n') || ''}
							onChange={e =>
								setFormData({
									...formData,
									bio_text: e.target.value.split('\n'),
								})
							}
							className='w-full px-3 py-2 border rounded-lg'
							rows={6}
							required
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-1'>
							Achievements (JSON format)
						</label>
						<textarea
							value={JSON.stringify(formData.achievements, null, 2) || '{}'}
							onChange={e => {
								try {
									setFormData({
										...formData,
										achievements: JSON.parse(e.target.value),
									})
								} catch (error) {
									// Handle JSON parse error
								}
							}}
							className='w-full px-3 py-2 border rounded-lg font-mono text-sm'
							rows={6}
							required
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Quote
							</label>
							<input
								type='text'
								value={formData.quote || ''}
								onChange={e =>
									setFormData({ ...formData, quote: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Quote Author
							</label>
							<input
								type='text'
								value={formData.quote_author || ''}
								onChange={e =>
									setFormData({ ...formData, quote_author: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
					</div>

					<div className='flex justify-end'>
						<button
							type='submit'
							className='bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2'>
							<Save className='w-5 h-5' />
							<span>Save Changes</span>
						</button>
					</div>
				</form>
			</div>
		)
	}

	return (
		<div>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-2xl font-light'>Gestionar Acerca de</h2>
				<button
					onClick={() => setIsEditing(true)}
					className='bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2'>
					<Save className='w-5 h-5' />
					<span>Editar Contenido</span>
				</button>
			</div>

			{content && (
				<div className='space-y-8'>
					<div className='grid grid-cols-2 gap-8'>
						<div className='relative h-64 rounded-lg overflow-hidden'>
							<Image
								src={content.hero_image}
								alt='Hero'
								fill
								className='object-cover'
							/>
							<div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center'>
								<div className='text-white text-center'>
									<h1 className='text-3xl font-light mb-2'>
										{content.artist_name}
									</h1>
									<p>{content.hero_subtitle}</p>
								</div>
							</div>
						</div>
						<div className='relative h-64 rounded-lg overflow-hidden'>
							<Image
								src={content.artist_image}
								alt={content.artist_name}
								fill
								className='object-cover'
							/>
						</div>
					</div>

					<div className='bg-white rounded-lg p-6 shadow-sm'>
						<h3 className='text-xl font-light mb-4'>Bio</h3>
						<div className='space-y-4'>
							{content.bio_text.map((paragraph, index) => (
								<p
									key={index}
									className='text-gray-600'>
									{paragraph}
								</p>
							))}
						</div>
					</div>

					<div className='grid grid-cols-3 gap-6'>
						{/* 	{content.achievements.map((achievement, index) => (
							<div
								key={index}
								className='bg-white rounded-lg p-6 shadow-sm text-center'>
								<div className='w-12 h-12 mx-auto mb-4'>
									<Image
										src={achievement.icon}
										alt={achievement.title}
										width={48}
										height={48}
										className='object-contain'
									/>
								</div>
								<div className='text-3xl font-light mb-2'>
									{achievement.value}
								</div>
								<div className='text-sm text-gray-500'>{achievement.title}</div>
							</div>
						))} */}
					</div>

					<div className='bg-white rounded-lg p-6 shadow-sm text-center'>
						<blockquote className='text-2xl font-light italic mb-4'>
							&quot;{content.quote}&quot;
						</blockquote>
						<cite className='text-gray-500'>— {content.quote_author}</cite>
					</div>
				</div>
			)}
		</div>
	)
}
