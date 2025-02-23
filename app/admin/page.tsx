'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AdminPage: React.FC = () => {
	const router = useRouter()

	useEffect(() => {
		router.push('/admin/dashboard')
	}, [router])

	return null
}

export default AdminPage
