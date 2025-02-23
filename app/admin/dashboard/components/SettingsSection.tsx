'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Save, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useSite } from '@/lib/store/site-context'

type SiteConfig = {
	id: string
	museum_name: string
	primary_color: string
	text_color: string
	background_color: string
	enable_shop: boolean
}

export function SettingsSection() {
	const { refreshConfig } = useSite()
	const [config, setConfig] = useState<SiteConfig | null>(null)
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState<Partial<SiteConfig>>({})
	const supabase = createClientComponentClient()

	useEffect(() => {
		fetchConfig()
	}, [])

	const fetchConfig = async () => {
		const { data } = await supabase.from('site_config').select('*').single()

		if (data) {
			setConfig(data)
			setFormData(data)
		}
		setLoading(false)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (config) {
			const { error } = await supabase
				.from('site_config')
				.update(formData)
				.eq('id', config.id)

			if (!error) {
				await fetchConfig()
				await refreshConfig()
				setIsEditing(false)
			}
		} else {
			const { error } = await supabase.from('site_config').insert([formData])

			if (!error) {
				await fetchConfig()
				await refreshConfig()
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
					<h3 className='text-xl font-light'>Editar Config</h3>
					<button
						onClick={() => setIsEditing(false)}
						className='text-gray-500 hover:text-black'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Nombre de museo
							</label>
							<input
								type='text'
								value={formData.museum_name || ''}
								onChange={e =>
									setFormData({ ...formData, museum_name: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Color primario
							</label>
							<div className='flex space-x-2'>
								<input
									type='color'
									value={formData.primary_color || '#000000'}
									onChange={e =>
										setFormData({ ...formData, primary_color: e.target.value })
									}
									className='h-10 w-10 rounded border p-1'
								/>
								<input
									type='text'
									value={formData.primary_color || '#000000'}
									onChange={e =>
										setFormData({ ...formData, primary_color: e.target.value })
									}
									className='flex-1 px-3 py-2 border rounded-lg'
									pattern='^#[0-9A-Fa-f]{6}$'
									required
								/>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Color de texto
							</label>
							<div className='flex space-x-2'>
								<input
									type='color'
									value={formData.text_color || '#000000'}
									onChange={e =>
										setFormData({ ...formData, text_color: e.target.value })
									}
									className='h-10 w-10 rounded border p-1'
								/>
								<input
									type='text'
									value={formData.text_color || '#000000'}
									onChange={e =>
										setFormData({ ...formData, text_color: e.target.value })
									}
									className='flex-1 px-3 py-2 border rounded-lg'
									pattern='^#[0-9A-Fa-f]{6}$'
									required
								/>
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Color de fondo
							</label>
							<div className='flex space-x-2'>
								<input
									type='color'
									value={formData.background_color || '#FFFFFF'}
									onChange={e =>
										setFormData({
											...formData,
											background_color: e.target.value,
										})
									}
									className='h-10 w-10 rounded border p-1'
								/>
								<input
									type='text'
									value={formData.background_color || '#FFFFFF'}
									onChange={e =>
										setFormData({
											...formData,
											background_color: e.target.value,
										})
									}
									className='flex-1 px-3 py-2 border rounded-lg'
									pattern='^#[0-9A-Fa-f]{6}$'
									required
								/>
							</div>
						</div>
					</div>

					<div>
						<label className='flex items-center space-x-2'>
							<input
								type='checkbox'
								checked={formData.enable_shop || false}
								onChange={e =>
									setFormData({ ...formData, enable_shop: e.target.checked })
								}
								className='rounded border-gray-300 text-black focus:ring-black'
							/>
							<span className='text-sm font-medium text-gray-700'>
								Habilitar tienda
							</span>
						</label>
					</div>

					<div className='flex justify-end'>
						<button
							type='submit'
							className='bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2'>
							<Save className='w-5 h-5' />
							<span>Guardar cambios</span>
						</button>
					</div>
				</form>
			</div>
		)
	}

	return (
		<div>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-2xl font-light'>Configuración del museo</h2>
				<button
					onClick={() => setIsEditing(true)}
					className='bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2'>
					<Save className='w-5 h-5' />
					<span>Editar</span>
				</button>
			</div>

			{config && (
				<div className='bg-white rounded-lg p-6 shadow-sm'>
					<div className='space-y-6'>
						<div>
							<h3 className='text-sm font-medium text-gray-500'>
								Nombre del museo
							</h3>
							<p className='mt-1 text-lg'>{config.museum_name}</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							<div>
								<h3 className='text-sm font-medium text-gray-500'>
									Color Primario
								</h3>
								<div className='mt-1 flex items-center space-x-2'>
									<div
										className='w-6 h-6 rounded border'
										style={{ backgroundColor: config.primary_color }}
									/>
									<span>{config.primary_color}</span>
								</div>
							</div>

							<div>
								<h3 className='text-sm font-medium text-gray-500'>
									Color de Texto
								</h3>
								<div className='mt-1 flex items-center space-x-2'>
									<div
										className='w-6 h-6 rounded border'
										style={{ backgroundColor: config.text_color }}
									/>
									<span>{config.text_color}</span>
								</div>
							</div>

							<div>
								<h3 className='text-sm font-medium text-gray-500'>
									Color de Fondo
								</h3>
								<div className='mt-1 flex items-center space-x-2'>
									<div
										className='w-6 h-6 rounded border'
										style={{ backgroundColor: config.background_color }}
									/>
									<span>{config.background_color}</span>
								</div>
							</div>
						</div>

						<div>
							<h3 className='text-sm font-medium text-gray-500'>
								Tienda habilitada
							</h3>
							<p className='mt-1 text-lg'>
								{config.enable_shop ? 'Enabled' : 'Disabled'}
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
