import './globals.css'
import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import Navigation from '@/components/Navigation'
import { CartProvider } from '@/lib/store/cart-context'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { SiteProvider } from '@/lib/store/site-context'
import { Main } from '@/components/Main'
import { AtrilProvider } from '@/lib/store/virtual-tour-context'
import { Toaster } from '@/components/ui/toaster'

const playfair = Playfair_Display({
	subsets: ['latin'],
	display: 'swap',
})

export const metadata: Metadata = {
	title: 'Museum',
	description: 'A modern art museum showcasing the works of Kerli',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en'>
			<AtrilProvider>
				<SiteProvider>
					<body className={`${playfair.className} `}>
						<CartProvider>
							<Navigation />
							<Main>{children}</Main>
							<CartDrawer />
						</CartProvider>
						<Toaster />
					</body>
				</SiteProvider>
			</AtrilProvider>
		</html>
	)
}
