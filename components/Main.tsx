'use client'
import { useSite } from '@/lib/store/site-context'
import { ReactNode } from 'react'

interface MainProps {
	children: ReactNode
}

export const Main: React.FC<MainProps> = ({ children }) => {
	const { config } = useSite()
	return (
		<main
			style={{
				backgroundColor: config?.background_color || 'white',
				color: config?.text_color || 'black',
			}}>
			{children}
		</main>
	)
}
