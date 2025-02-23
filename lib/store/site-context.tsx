'use client'

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type SiteConfig = {
	id: string
	museum_name: string
	primary_color: string
	text_color: string
	background_color: string
	enable_shop: boolean
}

type SiteContextType = {
	config: SiteConfig | null
	loading: boolean
	refreshConfig: () => Promise<void>
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

export function SiteProvider({ children }: { children: ReactNode }) {
	const [config, setConfig] = useState<SiteConfig | null>(null)
	const [loading, setLoading] = useState(true)
	const supabase = createClientComponentClient()

	const fetchConfig = async () => {
		const { data } = await supabase.from('site_config').select('*').single()

		if (data) {
			setConfig(data)
		}
		setLoading(false)
	}

	useEffect(() => {
		fetchConfig()
	}, [])

	return (
		<SiteContext.Provider
			value={{
				config,
				loading,
				refreshConfig: fetchConfig,
			}}>
			{children}
		</SiteContext.Provider>
	)
}

export function useSite() {
	const context = useContext(SiteContext)
	if (context === undefined) {
		throw new Error('useSite must be used within a SiteProvider')
	}
	return context
}
