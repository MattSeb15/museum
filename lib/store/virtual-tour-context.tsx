'use client'
import React, { createContext, useContext, useState } from 'react'

interface AtrilContextProps {
	isSelectedAtril: boolean
	setIsSelectedAtril: (value: boolean) => void
}

const AtrilContext = createContext<AtrilContextProps | undefined>(undefined)

export const AtrilProvider: React.FC<React.PropsWithChildren<{}>> = ({
	children,
}) => {
	const [isSelectedAtril, setIsSelectedAtril] = useState(false)

	return (
		<AtrilContext.Provider value={{ isSelectedAtril, setIsSelectedAtril }}>
			{children}
		</AtrilContext.Provider>
	)
}

export const useAtril = () => {
	const context = useContext(AtrilContext)
	if (!context) {
		throw new Error('useAtril must be used within an AtrilProvider')
	}
	return context
}
