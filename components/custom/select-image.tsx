import { cn, formatFileSize } from '@/lib/utils'
import { set } from 'date-fns'
import React, { useState, useImperativeHandle, forwardRef } from 'react'
interface SelectImageProps {
	onImageSelect?: (image: string | null | ArrayBuffer | File) => void
}

// eslint-disable-next-line react/display-name
const SelectImage: React.FC<SelectImageProps> = forwardRef(
	({ onImageSelect }, ref) => {
		const [selectedImage, setSelectedImage] = useState<
			string | ArrayBuffer | null
		>(null)

		const [file, setFile] = useState<File | null>(null)

		useImperativeHandle(ref, () => ({
			getSelectedImage: () => selectedImage,
		}))

		const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			if (event.target.files && event.target.files[0]) {
				const reader = new FileReader()
				reader.onload = e => {
					if (e.target?.result) {
						const image = e.target.result
						setSelectedImage(image)
						setFile(event.target.files![0])
						if (onImageSelect) {
							const ImageFile = event.target.files![0]
							onImageSelect(ImageFile)
						}
					}
				}
				reader.readAsDataURL(event.target.files[0])
			}
		}

		return (
			<div className='flex flex-col justify-center items-center'>
				<div
					className={cn(
						'border-2 border-dashed border-gray-300 w-52 h-52 flex justify-center items-center cursor-pointer',
						selectedImage && 'border-transparent'
					)}>
					<input
						type='file'
						accept='image/*'
						className='hidden'
						id='image-picker'
						onChange={handleImageChange}
					/>
					<label
						htmlFor='image-picker'
						className='w-full h-full flex justify-center items-center cursor-pointer'>
						{selectedImage ? (
							<picture>
								<img
									src={selectedImage as string}
									alt='Selected'
									className='max-w-full max-h-full'
								/>
							</picture>
						) : (
							<span className='text-3xl text-gray-300'>🖼️</span>
						)}
					</label>
				</div>

				{selectedImage ? (
					<>
						{file && (
							<>
								<p className='text-sm text-gray-500 ml-2'>
									<span>Tamaño de archivo: </span>
									{formatFileSize(file.size)}
								</p>
							</>
						)}
						<label
							htmlFor='image-picker'
							className='mt-2 text-sm text-gray-500 cursor-pointer'>
							Reemplazar
						</label>
					</>
				) : (
					<label
						htmlFor='image-picker'
						className='mt-2 text-sm text-gray-500 cursor-pointer'>
						Seleccionar imagen
					</label>
				)}
			</div>
		)
	}
)

/* export default SelectImage
const SelectImage: React.FC = () => {
	const [selectedImage, setSelectedImage] = useState<string | null>(null)

	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			const reader = new FileReader()
			reader.onload = e => {
				if (e.target?.result) {
					setSelectedImage(e.target.result as string)
				}
			}
			reader.readAsDataURL(event.target.files[0])
		}
	}

	return (
		<div className='border-2 border-dashed border-gray-300 w-52 h-52 flex justify-center items-center cursor-pointer'>
			<input
				type='file'
				accept='image/*'
				className='hidden'
				id='image-picker'
				onChange={handleImageChange}
			/>
			<label
				htmlFor='image-picker'
				className='w-full h-full flex justify-center items-center'>
				{selectedImage ? (
					<picture>
						<img
							src={selectedImage}
							alt='Selected'
							className='max-w-full max-h-full'
						/>
					</picture>
				) : (
					<span className='text-3xl text-gray-300'>🖼️</span>
				)}
			</label>
		</div>
	)
} */

export default SelectImage
