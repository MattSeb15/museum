'use client'

import { ShoppingBag, X, Plus, Minus, Send } from 'lucide-react'
import Image from 'next/image'
import { useCart } from '@/lib/store/cart-context'
import { useState } from 'react'
import { useSite } from '@/lib/store/site-context'

export function CartDrawer() {
	const { config } = useSite()
	const [isOpen, setIsOpen] = useState(false)
	const { items, removeItem, updateQuantity, total } = useCart()
	if (!config?.enable_shop) return null

	const sendToWhatsApp = () => {
		const phoneNumber = '34123456789' // Replace with your WhatsApp number
		const message = `New Order:\n\n${items
			.map(
				item =>
					`${item.quantity}x ${item.productName} with "${
						item.artworkTitle
					}"\nPrice: $${(item.price * item.quantity).toFixed(2)}\n`
			)
			.join('\n')}Total: $${total.toFixed(2)}`

		const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
			message
		)}`
		window.open(whatsappUrl, '_blank')
	}

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className='fixed z-50 bottom-8 right-8 bg-black text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors'>
				<ShoppingBag className='w-6 h-6' />
				{items.length > 0 && (
					<span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center'>
						{items.length}
					</span>
				)}
			</button>

			{isOpen && (
				<div className='fixed inset-0 z-50 bg-black bg-opacity-50'>
					<div className='absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl'>
						<div className='flex h-full flex-col'>
							{/* Header */}
							<div className='flex items-center justify-between border-b px-6 py-4'>
								<h2 className='text-xl font-light'>Shopping Cart</h2>
								<button
									onClick={() => setIsOpen(false)}
									className='text-gray-400 hover:text-black transition-colors'>
									<X className='h-6 w-6' />
								</button>
							</div>

							{/* Cart Items */}
							<div className='flex-1 overflow-y-auto py-4'>
								{items.length === 0 ? (
									<div className='flex flex-col items-center justify-center h-full text-gray-500'>
										<ShoppingBag className='h-12 w-12 mb-4' />
										<p>Your cart is empty</p>
									</div>
								) : (
									<div className='space-y-4 px-6'>
										{items.map(item => (
											<div
												key={item.id}
												className='flex items-center space-x-4 bg-gray-50 p-4 rounded-lg'>
												<div className='relative w-20 h-20 bg-white rounded-md overflow-hidden'>
													<Image
														src={item.mockupImage}
														alt={item.productName}
														fill
														className='object-cover'
													/>
													<div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-20'>
														<Image
															src={item.image}
															alt={item.artworkTitle}
															width={40}
															height={40}
															className='object-contain'
														/>
													</div>
												</div>
												<div className='flex-1'>
													<h3 className='font-medium'>{item.productName}</h3>
													<p className='text-sm text-gray-500'>
														with &quot;{item.artworkTitle}&quot;
													</p>
													<div className='mt-2 flex items-center space-x-4'>
														<div className='flex items-center space-x-2'>
															<button
																onClick={() =>
																	updateQuantity(item.id, item.quantity - 1)
																}
																className='text-gray-500 hover:text-black transition-colors'>
																<Minus className='h-4 w-4' />
															</button>
															<span className='w-8 text-center'>
																{item.quantity}
															</span>
															<button
																onClick={() =>
																	updateQuantity(item.id, item.quantity + 1)
																}
																className='text-gray-500 hover:text-black transition-colors'>
																<Plus className='h-4 w-4' />
															</button>
														</div>
														<span className='flex-1 text-right'>
															${(item.price * item.quantity).toFixed(2)}
														</span>
													</div>
												</div>
												<button
													onClick={() => removeItem(item.id)}
													className='text-gray-400 hover:text-red-500 transition-colors'>
													<X className='h-5 w-5' />
												</button>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Footer */}
							{items.length > 0 && (
								<div className='border-t px-6 py-4'>
									<div className='flex justify-between mb-4'>
										<span className='text-lg'>Total</span>
										<span className='text-lg font-medium'>
											${total.toFixed(2)}
										</span>
									</div>
									<button
										onClick={sendToWhatsApp}
										className='w-full bg-green-500 text-white py-3 rounded-full flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors'>
										<Send className='h-5 w-5' />
										<span>Send to WhatsApp</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	)
}
