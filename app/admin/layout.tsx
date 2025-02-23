'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const router = useRouter()
	const supabase = createClientComponentClient()

	useEffect(() => {
		const checkAdmin = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()

			if (!session) {
				router.push('/admin/login')
				return
			}

			const { data: adminUser } = await supabase
				.from('admin_users')
				.select('id')
				.eq('id', session.user.id)
				.single()

			if (!adminUser) {
				router.push('/admin/login')
			}
		}

		checkAdmin()
	}, [router, supabase])

	return <div className='min-h-screen bg-gray-100'>{children}</div>
}
