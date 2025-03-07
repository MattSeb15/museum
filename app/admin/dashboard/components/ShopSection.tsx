'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import Image from 'next/image'
import { Skeleton } from '@/components/ui/skeleton'
import { Product } from '@/lib/types'

export function ShopSection() {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [isEditing, setIsEditing] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [formData, setFormData] = useState<Partial<Product>>({})
	const supabase = createClientComponentClient()

	useEffect(() => {
		fetchProducts()
	}, [])

	const fetchProducts = async () => {
		const { data } = await supabase
			.from('products')
			.select('*')
			.order('created_at', { ascending: false })

		if (data) {
			setProducts(data)
		}
		setLoading(false)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (selectedProduct) {
			const { error } = await supabase
				.from('products')
				.update(formData)
				.eq('id', selectedProduct.id)

			if (!error) {
				fetchProducts()
				setIsEditing(false)
				setSelectedProduct(null)
			}
		} else {
			const { error } = await supabase.from('products').insert([formData])

			if (!error) {
				fetchProducts()
				setIsEditing(false)
			}
		}
	}

	const handleDelete = async (id: string) => {
		if (confirm('Are you sure you want to delete this product?')) {
			const { error } = await supabase.from('products').delete().eq('id', id)

			if (!error) {
				fetchProducts()
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
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{Array.from({ length: 6 }).map((_, i) => (
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
						{selectedProduct ? 'Edit Product' : 'Add New Product'}
					</h3>
					<button
						onClick={() => {
							setIsEditing(false)
							setSelectedProduct(null)
						}}
						className='text-gray-500 hover:text-black'>
						<X className='w-5 h-5' />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className='space-y-4'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Nombre
							</label>
							<input
								type='text'
								value={formData.name || ''}
								onChange={e =>
									setFormData({ ...formData, name: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Categoria
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
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Precio
							</label>
							<input
								type='number'
								step='0.01'
								value={formData.price || ''}
								onChange={e =>
									setFormData({
										...formData,
										price: parseFloat(e.target.value),
									})
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-1'>
								Image URL
							</label>
							<input
								type='url'
								value={formData.image || ''}
								onChange={e =>
									setFormData({ ...formData, image: e.target.value })
								}
								className='w-full px-3 py-2 border rounded-lg'
								required
							/>
						</div>
					</div>

					<div className='flex justify-end'>
						<button
							type='submit'
							className='bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800'>
							{selectedProduct ? 'Update' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		)
	}

	return (
		<div>
			<div className='flex justify-between items-center mb-6'>
				<h2 className='text-2xl font-light'>Manage Shop</h2>
				<button
					onClick={() => {
						setFormData({})
						setIsEditing(true)
					}}
					className='bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center space-x-2'>
					<Plus className='w-5 h-5' />
					<span>Add New</span>
				</button>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{products.map(product => (
					<div
						key={product.id}
						className='bg-white rounded-lg shadow-sm overflow-hidden group'>
						<div className='relative h-48'>
							<Image
								src={product.image}
								alt={product.name}
								fill
								className='object-cover'
							/>
							<div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300'>
								<div className='absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300'>
									<button
										onClick={() => {
											setSelectedProduct(product)
											setFormData(product)
											setIsEditing(true)
										}}
										className='p-2 bg-white rounded-full hover:bg-gray-100'>
										<Pencil className='w-4 h-4' />
									</button>
									<button
										onClick={() => handleDelete(product.id)}
										className='p-2 bg-white rounded-full hover:bg-gray-100 hover:text-red-500'>
										<Trash2 className='w-4 h-4' />
									</button>
								</div>
							</div>
						</div>
						<div className='p-4'>
							<h3 className='text-lg font-medium mb-1'>{product.name}</h3>
							<div className='flex justify-between text-sm'>
								<span className='text-gray-500'>{product.category}</span>
								<span className='font-medium'>${product.price}</span>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
