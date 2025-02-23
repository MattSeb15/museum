'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ArtworkDisplay } from './components/ArtworkDisplay'
import { Skeleton } from '@/components/ui/skeleton'
import { Artwork } from '@/lib/types'

export default function ArtworkPage({ params }: { params: { id: string } }) {
	const [artwork, setArtwork] = useState<Artwork | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchArtwork = async () => {
			const { data } = await supabase
				.from('artworks')
				.select('*')
				.eq('id', params.id)
				.single()

			if (data) {
				setArtwork(data)
			}
			setLoading(false)
		}

		fetchArtwork()
	}, [params.id])

	if (loading) {
		return (
			<div className='min-h-screen pt-20'>
				<div className='max-w-7xl mx-auto px-4 py-8'>
					<Skeleton className='w-32 h-10 mb-8' />
					<div className='grid md:grid-cols-2 gap-12'>
						<Skeleton className='aspect-[4/5] w-full' />
						<div className='space-y-6'>
							<Skeleton className='h-8 w-2/3' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-3/4' />
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Skeleton className='h-4 w-20 mb-2' />
									<Skeleton className='h-6 w-32' />
								</div>
								<div>
									<Skeleton className='h-4 w-20 mb-2' />
									<Skeleton className='h-6 w-32' />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!artwork) {
		return null
	}

	return <ArtworkDisplay artwork={artwork} />
}
