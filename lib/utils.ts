import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number) {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

	if (bytes === 0) return '0 Byte'

	const i = Math.floor(Math.log(bytes) / Math.log(1024))
	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
}

export function hexColorToRGB(hex: string, alpha = 1): string {
	if (!hex) return 'rgba(0, 0, 0, 1)'
	if (hex.startsWith('#')) hex = hex.slice(1)
	if (hex.length !== 6) return 'rgba(0, 0, 0, 1)'
	if (alpha < 0 || alpha > 1) return 'rgba(0, 0, 0, 1)'
	const r = parseInt(hex.slice(0, 2), 16)
	const g = parseInt(hex.slice(2, 4), 16)
	const b = parseInt(hex.slice(4, 6), 16)

	return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
