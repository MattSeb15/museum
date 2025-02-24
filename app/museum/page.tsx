'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
	OrbitControls,
	PerspectiveCamera,
	SpotLight,
	Text,
} from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'

import '../../app/virtual.css'
import { useAtril } from '@/lib/store/virtual-tour-context'
import {
	ArrowLeftIcon,
	ChevronUp,
	PauseIcon,
	PlayIcon,
	RefreshCwIcon,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Artwork, Museum, MuseumItem } from '@/lib/types'
/* import {
	Select,
	SelectContent,

	SelectPortal,
	SelectViewport,
} from '@radix-ui/react-select' */
import {
	SelectItem,
	SelectTrigger,
	SelectValue,
	SelectContent,
	Select,
} from '@/components/ui/select'

type PositionedPainting = {
	position: number[]
	wall: 'left' | 'right' | 'front'
}

const paintingsPositions: PositionedPainting[] = [
	{
		position: [-9.8, 2, -5],
		wall: 'left',
	},
	{
		position: [-9.8, 2, -15],
		wall: 'left',
	},
	{
		position: [0.1, 2, -24.8],
		wall: 'front',
	},
	{
		position: [9.8, 2, -15],
		wall: 'right',
	},
	{
		position: [9.8, 2, -5],
		wall: 'right',
	},
]

const paintings = [
	{
		visible: true,
		artwork: {
			title: 'Título del cuadro 1',
			description: 'Descripción del cuadro 1',
			image_url:
				'https://images.unsplash.com/photo-1739643247007-044e2623ca98?q=80&w=2129&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
		},
	},
	{
		visible: true,
		artwork: {
			title: 'Título del cuadro 2',
			description: 'Descripción del cuadro 2',
			image_url:
				'https://images.unsplash.com/photo-1739469600176-b58ebd9b9404?q=80&w=1939&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
		},
	},
	{
		visible: false,
		artwork: {
			title: 'Mona Lisa 5',
			description: 'Descripción de Mona Lisa 5',
			image_url:
				'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Leonardo_da_Vinci_-_Mona_Lisa_%28Louvre%2C_Paris%29.jpg/1200px-Leonardo_da_Vinci_-_Mona_Lisa_%28Louvre%2C_Paris%29.jpg',
		},
	},
	{
		visible: true,
		artwork: {
			title: 'Título del cuadro 3',
			description: 'Descripción del cuadro 3',
			image_url:
				'https://images.unsplash.com/photo-1739999373818-ab59c32b23c1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
		},
	},
	{ visible: true, artwork: null },
]

function Atril({
	position,
	rotation,
	artwork,
	isInView,
	cardRef, // Añadimos el tipo de cardRef
	cursorRef, // Añadimos el tipo de cursorRef
}: {
	position: THREE.Vector3
	rotation: THREE.Euler
	artwork: Artwork | null
	isInView: boolean
	cardRef: React.RefObject<HTMLDivElement> // Añadimos el tipo de cardRef
	cursorRef: React.RefObject<HTMLDivElement> // Añadimos el tipo de cursorRef
}) {
	const atrilHeight = 1.5
	const atrilWidth = 0.5
	const atrilDepth = 0.5
	const topWidth = 1
	const topDepth = 0.4
	const topHeight = 0.1

	const { setIsSelectedAtril } = useAtril()

	const handlePointerOver = () => {
		if (cardRef.current) {
			cardRef.current.innerHTML = `<h3 class="text-lg font-bold">${
				artwork?.title ?? ''
			}</h3><p class="w-72 text-sm">${artwork?.description ?? ''}</p>`
			cardRef.current.classList.add('show')
		}
		if (cursorRef.current) {
			cursorRef.current.style.setProperty('--cursor-scale', '2')
		}
		setIsSelectedAtril(true)
	}

	const handlePointerOut = () => {
		setIsSelectedAtril(false)
		if (cursorRef.current) {
			cursorRef.current.style.setProperty('--cursor-scale', '1')
		}
		if (cardRef.current) {
			cardRef.current.innerHTML = ''
			cardRef.current.classList.remove('show')
		}
	}

	return (
		<group
			position={position}
			rotation={rotation}>
			{/* Base del atril */}
			<mesh position={[0, atrilHeight / 2, 0]}>
				<boxGeometry args={[atrilWidth, atrilHeight, atrilDepth]} />
				<meshStandardMaterial color='#FFFFFF' />
			</mesh>
			{/* Parte superior inclinada */}
			<mesh
				position={[
					0,
					atrilHeight + topHeight / 2,
					-atrilDepth / 2 + topDepth / 2,
				]}
				rotation={[-Math.PI / 6, 0, 0]}
				onPointerOver={isInView ? handlePointerOver : undefined}
				onPointerOut={isInView ? handlePointerOut : undefined}>
				<boxGeometry args={[topWidth, topHeight, topDepth]} />
				<meshStandardMaterial color='#FFFFFF' />
			</mesh>
			{/* Texto de descripción */}
			{/* 			<Text
				position={[
					0,
					atrilHeight + topHeight / 2 + 0.1,
					-atrilDepth / 2 + topDepth / 2 + 0.01,
				]}
				rotation={[Math.PI / 3, -Math.PI, 0]}
				fontSize={0.08}
				color='#000000'
				anchorX='center'
				anchorY='middle'>
				{text}
			</Text> */}
		</group>
	)
}

const setRotationByWall = (wall: 'left' | 'right' | 'front') => {
	switch (wall) {
		case 'left':
			return [0, Math.PI / 2, 0]
		case 'right':
			return [0, -Math.PI / 2, 0]
		case 'front':
			return [0, 0, 0]
		default:
			return [0, 0, 0]
	}
}

function Painting({
	position,
	wall,
	onClick,
	isInView,
	artwork,
	visible,
	cursorRef,
	cardRef,
}: {
	position: number[]
	wall: 'left' | 'right' | 'front'
	onClick: () => void
	isInView: boolean
	visible: boolean
	artwork: Artwork | null
	cursorRef: React.RefObject<HTMLDivElement> //
	cardRef: React.RefObject<HTMLDivElement>
}) {
	const rotation = setRotationByWall(wall)
	const atrilPosition = new THREE.Vector3(position[0], -2, position[2])
	const atrilRotation = new THREE.Euler(
		rotation[0],
		rotation[1] + Math.PI,
		rotation[2]
	)
	if (!visible) return null

	if (!artwork) {
		return (
			<>
				<SpotlightRigComponent position={position} />
				<mesh
					position={new THREE.Vector3(...position)}
					rotation={new THREE.Euler(...rotation)}>
					<planeGeometry args={[6, 4]} />
					<meshStandardMaterial
						side={THREE.FrontSide}
						metalness={0.1}
						roughness={0.8}
						emissive='#ffffff'
						emissiveIntensity={0.02}
					/>
				</mesh>
				<Atril
					position={atrilPosition}
					rotation={atrilRotation}
					artwork={artwork}
					cardRef={cardRef} // Pasamos cardRef al componente Atril
					isInView={isInView}
					cursorRef={cursorRef} // Pasamos cursorRef al componente Atril
				/>
			</>
		)
	}

	return (
		<PaintingWithArtWork
			position={position}
			wall={wall}
			onClick={onClick}
			isInView={isInView}
			artwork={artwork}
			cursorRef={cursorRef}
			cardRef={cardRef}
		/>
	)
}

function PaintingWithArtWork({
	position,
	wall,
	onClick,
	isInView,
	artwork,
	cursorRef,
	cardRef,
}: {
	position: number[]
	wall: 'left' | 'right' | 'front'
	onClick: () => void
	isInView: boolean
	artwork: Artwork
	cursorRef: React.RefObject<HTMLDivElement> //
	cardRef: React.RefObject<HTMLDivElement>
}) {
	const rotation = setRotationByWall(wall)
	const atrilPosition = new THREE.Vector3(position[0], -2, position[2])
	const atrilRotation = new THREE.Euler(
		rotation[0],
		rotation[1] + Math.PI,
		rotation[2]
	)

	const texture = useLoader(TextureLoader, artwork.image_url)
	const [imageDimensions, setImageDimensions] = useState({
		width: 1,
		height: 1,
	})

	useEffect(() => {
		if (!artwork.image_url) {
			setImageDimensions({ width: 6, height: 4 })
			return
		}
		const img = new Image()
		img.src = artwork.image_url
		img.onload = () => {
			const aspectRatio = img.width / img.height
			setImageDimensions({ width: 4 * aspectRatio, height: 4 })
		}
	}, [artwork.image_url])

	const handlePointerOver = () => {
		if (!isInView) {
			if (cursorRef.current) {
				cursorRef.current.style.setProperty('--cursor-scale', '2')
			}
			if (cardRef.current) {
				cardRef.current.textContent = artwork.title
				cardRef.current.classList.add('show')
			}
		} else {
			// el cursor desaparece
			if (cursorRef.current) {
				cursorRef.current.style.setProperty('--cursor-scale', '0')
			}
		}
	}

	const handlePointerOut = () => {
		if (!isInView) {
			if (cursorRef.current) {
				cursorRef.current.style.setProperty('--cursor-scale', '1')
			}
			if (cardRef.current) {
				cardRef.current.classList.remove('show')
			}
		} else {
			// el cursor aparece
			if (cursorRef.current) {
				cursorRef.current.style.setProperty('--cursor-scale', '1')
			}
		}
	}
	return (
		<>
			<SpotlightRigComponent position={position} />
			<mesh
				position={new THREE.Vector3(...position)}
				rotation={new THREE.Euler(...rotation)}
				onClick={onClick}
				onPointerOver={handlePointerOver}
				onPointerOut={handlePointerOut}>
				<planeGeometry args={[imageDimensions.width, imageDimensions.height]} />
				<meshStandardMaterial
					map={texture}
					side={THREE.FrontSide}
					roughness={0.25}
					emissive='#ffffff'
					emissiveIntensity={0.02}
				/>
			</mesh>
			<Atril
				position={atrilPosition}
				rotation={atrilRotation}
				artwork={artwork}
				cardRef={cardRef}
				isInView={isInView}
				cursorRef={cursorRef}
			/>
		</>
	)
}

function Floor() {
	return (
		<mesh
			rotation={[-Math.PI / 2, 0, 0]}
			position={[0, -2, 0]}
			receiveShadow>
			<planeGeometry args={[50, 50]} />
			<meshStandardMaterial
				color='#666666'
				metalness={0.1}
				roughness={0.7}
			/>
		</mesh>
	)
}

function Walls() {
	return (
		<group>
			{/* Left wall */}
			<mesh
				position={[-10, 3, 0]}
				rotation={[0, Math.PI / 2, 0]}
				receiveShadow>
				<planeGeometry args={[50, 10]} />
				<meshStandardMaterial
					color='#ffffff'
					metalness={0.1}
					roughness={0.9}
					emissive='#ffffff'
					emissiveIntensity={0.1}
				/>
			</mesh>
			{/* Right wall */}
			<mesh
				position={[10, 3, 0]}
				rotation={[0, -Math.PI / 2, 0]}
				receiveShadow>
				<planeGeometry args={[50, 10]} />
				<meshStandardMaterial
					color='#ffffff'
					metalness={0.1}
					roughness={0.9}
					emissive='#ffffff'
					emissiveIntensity={0.1}
				/>
			</mesh>
			{/* Back wall */}
			<mesh
				position={[0, 3, -25]}
				receiveShadow>
				<planeGeometry args={[20, 10]} />
				<meshStandardMaterial
					color='#ffffff'
					metalness={0.1}
					roughness={0.9}
				/>
			</mesh>
			{/* Front wall */}
			<mesh
				position={[0, 3, 25]}
				rotation={[0, Math.PI, 0]}
				receiveShadow>
				<planeGeometry args={[20, 10]} />
				<meshStandardMaterial
					color='#ffffff'
					metalness={0.1}
					roughness={0.9}
				/>
			</mesh>
			{/* Ceiling */}
			<mesh
				position={[0, 8, 0]}
				rotation={[Math.PI / 2, 0, 0]}
				receiveShadow>
				<planeGeometry args={[20, 50]} />
				<meshStandardMaterial
					color='#ffffff'
					metalness={0.1}
					roughness={0.9}
					emissive='#ffffff'
					emissiveIntensity={0.1}
				/>
			</mesh>
		</group>
	)
}

function SpotlightRigComponent({ position }: { position: number[] }) {
	return (
		<group position={[position[0], 6, position[2]]}>
			<SpotLight
				castShadow
				distance={15}
				angle={0.7}
				attenuation={2}
				anglePower={4}
				intensity={5}
				position={[0, 0, 0]}
				target-position={[position[0], position[1], position[2]]}
			/>
		</group>
	)
}

function Lights() {
	return (
		<>
			{/* Ambient light for base illumination */}
			<ambientLight intensity={0.62} />

			{/* Main ceiling lights */}
			<pointLight
				position={[0, 7.5, 0]}
				intensity={0.2}
				castShadow
			/>
			<pointLight
				position={[0, 7.5, -10]}
				intensity={0.8}
				castShadow
			/>
			<pointLight
				position={[0, 7.5, -20]}
				intensity={0.2}
				castShadow
			/>
		</>
	)
}

function CameraAnimation({
	onAnimationComplete,
	isPaused,
	speed,
	resetAnimation,
	targetPosition,
	lookAtPosition,
	setOrbitEnabled,
	isMoving,
	setIsMoving,
}: {
	onAnimationComplete: () => void
	isPaused: boolean
	speed: number
	resetAnimation: boolean
	targetPosition: THREE.Vector3 | null
	lookAtPosition: THREE.Vector3 | null
	setOrbitEnabled: (enabled: boolean) => void
	isMoving: boolean
	setIsMoving: (moving: boolean) => void
}) {
	const { camera } = useThree()
	const startPosition = new THREE.Vector3(0, 2, 10)
	const endPosition = new THREE.Vector3(0, 2, -20)
	const startRotation = new THREE.Euler(0, 0, 0)
	const progress = useRef(0)

	useEffect(() => {
		if (resetAnimation) {
			progress.current = 0
			setIsMoving(true)
			camera.rotation.copy(startRotation)
		}
	}, [resetAnimation, camera, setIsMoving])

	useFrame(() => {
		if (isMoving && !isPaused) {
			progress.current += speed

			if (progress.current >= 1) {
				progress.current = 0 // Reinicia el progreso
				onAnimationComplete()
			}

			camera.position.lerpVectors(startPosition, endPosition, progress.current)
		}

		if (targetPosition && lookAtPosition) {
			const direction = new THREE.Vector3()
				.subVectors(targetPosition, camera.position)
				.normalize()
			const distance = camera.position.distanceTo(targetPosition)

			const step = isMoving
				? direction.multiplyScalar(speed * distance * 200)
				: direction.multiplyScalar(0) // Limita la velocidad máxima de la animación
			camera.position.add(step)

			if (camera.position.distanceTo(targetPosition) < 0.1) {
				/* 	camera.position.copy(targetPosition) */
				setIsMoving(false)
				setOrbitEnabled(true) // Habilita los controles de órbita
			}

			camera.lookAt(lookAtPosition)
		}
	})

	return null
}

function Scene({
	museumItems,
	artworks,
	onAnimationComplete,
	isPaused,
	speed,
	targetPosition,
	lookAtPosition,
	handlePaintingClick,
	resetAnimation,
	setOrbitEnabled,
	isMoving,
	setIsMoving,
	selectedPainting,
	cursorRef, // Añadimos cursorRef como propiedad
	cardRef, // Añadimos cardRef como propiedad
}: {
	museumItems: MuseumItem[]
	artworks: Artwork[]
	onAnimationComplete: () => void
	isPaused: boolean
	speed: number
	targetPosition: THREE.Vector3 | null
	lookAtPosition: THREE.Vector3 | null
	handlePaintingClick: (
		position: number[],
		rotation: number[],
		index: number
	) => void
	resetAnimation: boolean
	setOrbitEnabled: (enabled: boolean) => void
	isMoving: boolean
	setIsMoving: (moving: boolean) => void
	selectedPainting: number | null
	cursorRef: React.RefObject<HTMLDivElement> // Añadimos el tipo de cursorRef
	cardRef: React.RefObject<HTMLDivElement> // Añadimos el tipo de cardRef
}) {
	const { camera } = useThree()

	useEffect(() => {
		if (targetPosition && lookAtPosition) {
			const direction = new THREE.Vector3()
				.subVectors(targetPosition, camera.position)
				.normalize()
			const distance = camera.position.distanceTo(targetPosition)
			const step = direction.multiplyScalar(Math.min(0.2 * distance, 0.1)) // Limita la velocidad máxima de la animación
			camera.position.add(step)

			if (camera.position.distanceTo(targetPosition) < 0.1) {
				camera.position.copy(targetPosition)
				setOrbitEnabled(true) // Habilita los controles de órbita
			}

			camera.lookAt(lookAtPosition)
		}
	}, [targetPosition, lookAtPosition, camera, setOrbitEnabled])

	return (
		<>
			<CameraAnimation
				onAnimationComplete={onAnimationComplete}
				isPaused={isPaused}
				speed={speed}
				resetAnimation={resetAnimation}
				targetPosition={targetPosition}
				lookAtPosition={lookAtPosition}
				setOrbitEnabled={setOrbitEnabled}
				isMoving={isMoving}
				setIsMoving={setIsMoving}
			/>
			<Walls />
			<Floor />
			<Lights />
			{museumItems.map((item, index) => {
				const artwork = artworks.find(a => a.id === item.artwork_id)
				return (
					<Painting
						key={index}
						wall={paintingsPositions[index].wall}
						position={paintingsPositions[index].position}
						visible={item.visible}
						artwork={artwork || null}
						isInView={selectedPainting === index}
						cursorRef={cursorRef} // Pasamos cursorRef al componente Painting
						cardRef={cardRef} // Pasamos cardRef al componente Painting
						onClick={() =>
							handlePaintingClick(
								paintingsPositions[index].position,
								setRotationByWall(paintingsPositions[index].wall),
								index
							)
						}
					/>
				)
			})}
		</>
	)
}

const speedOptions = [0.5, 1, 5, 15, 20]

export default function ArtGallery() {
	const [animationComplete, setAnimationComplete] = useState(false)
	const [key, setKey] = useState(0)
	const [isPaused, setIsPaused] = useState(false)
	const [speed, setSpeed] = useState(0.0001) // Estado para la velocidad
	const [speedIndex, setSpeedIndex] = useState(1) // Estado para el índice de la velocidad
	const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(
		null
	)
	const [lookAtPosition, setLookAtPosition] = useState<THREE.Vector3 | null>(
		null
	)
	const [resetAnimation, setResetAnimation] = useState(false)
	const [orbitEnabled, setOrbitEnabled] = useState(false)
	const [isMoving, setIsMoving] = useState(true)
	const [selectedPainting, setSelectedPainting] = useState<number | null>(null)
	const angle = (100 * Math.PI) / 180
	const azimuthAngle = (50 * Math.PI) / 180
	const [minAzimuthAngle, setMinAzimuthAngle] = useState(azimuthAngle)
	const [maxAzimuthAngle, setMaxAzimuthAngle] = useState(Math.PI - azimuthAngle)
	const [minPolarAngle, setMinPolarAngle] = useState(Math.PI - angle)
	const [maxPolarAngle, setMaxPolarAngle] = useState(angle)

	const cursorRef = useRef<HTMLDivElement>(null)
	const trailRef = useRef<HTMLDivElement>(null)
	const cardRef = useRef<HTMLDivElement>(null)

	const { isSelectedAtril, setIsSelectedAtril } = useAtril()
	const router = useRouter()
	const searchParams = useSearchParams()
	const id = searchParams.get('id')
	const [currentMuseum, setCurrentMuseum] = useState<Museum | null>(null)
	const [museums, setMuseums] = useState<Museum[]>([])
	const [museumItems, setMuseumItems] = useState<MuseumItem[]>([])
	const [artworks, setArtworks] = useState<Artwork[]>([])

	const [loading, setLoading] = useState(true)

	const fetchMuseums = async (
		isFromChangeSelect?: boolean,
		museum?: Museum
	) => {
		if (isFromChangeSelect) {
			if (museum) {
				handleReset()
				setCurrentMuseum(museum)
				fetchMuseumItems(museum.museum_item_ids)
				router.push(`/museum?id=${museum.id}`)
			}
			return
		}
		const { data } = await supabase
			.from('museums')
			.select('*')
			.order('created_at', { ascending: false })

		if (data) {
			const sortedData = data.sort(
				(a, b) => (b.principal ? 1 : 0) - (a.principal ? 1 : 0)
			)
			setMuseums(sortedData)
			if (id) {
				fetchMuseumById(id)
			} else {
				fetchMuseumById(sortedData[0].id)

				router.push(`/museum?id=${sortedData[0].id}`)
			}
		}
	}

	const fetchMuseumById = async (id: string) => {
		const { data } = await supabase
			.from('museums')
			.select('*')
			.eq('id', id)
			.single()

		if (data) {
			setCurrentMuseum(data)
			fetchMuseumItems(data.museum_item_ids)
		}
	}

	const fetchArtworks = async () => {
		const { data } = await supabase
			.from('artworks')
			.select(
				'id, title, category, image_url, year, description, medium, dimensions, location'
			)

		if (data) {
			setArtworks(data)
		}
	}

	const fetchMuseumItems = async (itemIds: string[]) => {
		const { data } = await supabase
			.from('museum_items')
			.select('*')
			.in('id', itemIds)
			.order('index')

		if (data) {
			setMuseumItems(data)
		}
	}
	const fetchData = async (isFromChangeSelect?: boolean, museum?: Museum) => {
		setLoading(true)
		await fetchMuseums(isFromChangeSelect, museum)
		await fetchArtworks()
		setLoading(false)
	}

	useEffect(() => {
		fetchData()
	}, [])

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			if (cursorRef.current && trailRef.current) {
				cursorRef.current.style.setProperty('--cursor-x', `${event.clientX}px`)
				cursorRef.current.style.setProperty('--cursor-y', `${event.clientY}px`)
				trailRef.current.style.setProperty('--cursor-x', `${event.clientX}px`)
				trailRef.current.style.setProperty('--cursor-y', `${event.clientY}px`)
			}

			if (cardRef.current) {
				const cardWidth = cardRef.current.offsetWidth
				const cardHeight = cardRef.current.offsetHeight
				let cardX = event.clientX + 20
				let cardY = event.clientY + 20

				if (cardX + cardWidth > window.innerWidth) {
					cardX = event.clientX - cardWidth - 20
				}

				if (cardY + cardHeight > window.innerHeight) {
					cardY = event.clientY - cardHeight - 20
				}

				cardRef.current.style.left = `${cardX}px`
				cardRef.current.style.top = `${cardY}px`
			}
		}

		window.addEventListener('mousemove', handleMouseMove)
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
		}
	}, [])

	const handleReset = () => {
		setResetAnimation(true)
		setAnimationComplete(false)
		setIsPaused(false)
		setTargetPosition(null)
		setLookAtPosition(null)
		setOrbitEnabled(false)
		setSelectedPainting(null)
		setTimeout(() => setResetAnimation(false), 100) // Restablece resetAnimation a false después de un breve retraso
	}

	const handlePause = () => {
		setIsPaused(prev => !prev)
	}

	const handleSpeedChange = () => {
		const initialSpeed = 0.0001
		const newSpeedIndex = (speedIndex + 1) % speedOptions.length
		setSpeed(speedOptions[newSpeedIndex] * initialSpeed)
		setSpeedIndex(newSpeedIndex)
	}

	const handlePaintingClick = (
		position: number[],
		rotation: number[],
		index: number
	) => {
		if (selectedPainting === index) return
		if (cardRef.current) {
			cardRef.current.classList.remove('show')
		}
		setIsPaused(true)
		const offset = 6 // Distancia de la cámara frente al cuadro
		let cameraPosition: THREE.Vector3 | null = null
		let lookAtPosition: THREE.Vector3 | null = null

		if (rotation[1] === Math.PI / 2) {
			// Pared izquierda
			cameraPosition = new THREE.Vector3(
				position[0] + offset,
				position[1],
				position[2]
			)
			lookAtPosition = new THREE.Vector3(position[0], position[1], position[2])
			setMinAzimuthAngle(azimuthAngle)
			setMaxAzimuthAngle(Math.PI - azimuthAngle)
			setMaxPolarAngle(angle)
		} else if (rotation[1] === -Math.PI / 2) {
			// Pared derecha
			cameraPosition = new THREE.Vector3(
				position[0] - offset,
				position[1],
				position[2]
			)
			lookAtPosition = new THREE.Vector3(position[0], position[1], position[2])
			setMinAzimuthAngle(azimuthAngle + Math.PI)
			setMaxAzimuthAngle(-azimuthAngle)
			setMaxPolarAngle(angle)
		} else if (rotation[1] === 0) {
			// Pared trasera
			cameraPosition = new THREE.Vector3(
				position[0],
				position[1],
				position[2] + offset
			)
			lookAtPosition = new THREE.Vector3(position[0], position[1], position[2])
			setMinAzimuthAngle(azimuthAngle - Math.PI / 2)
			setMaxAzimuthAngle(Math.PI / 2 + (azimuthAngle - Math.PI / 2))
			setMaxPolarAngle(angle)
		}

		if (cameraPosition && lookAtPosition) {
			setTargetPosition(cameraPosition)
			setLookAtPosition(lookAtPosition)
			setOrbitEnabled(false) // Deshabilita los controles de órbita durante la animación
			setIsMoving(true) // Reinicia el estado de isMoving a true
			setSelectedPainting(index) // Establece el cuadro seleccionado
		}
	}

	if (loading) {
		return (
			<div className='relative h-screen w-full virtual-page'>
				<div className='flex items-center justify-center text-lg'>
					Cargando...
				</div>
			</div>
		)
	}

	function handleClickMuseum(value: string) {
		const museum = museums.find(museum => museum.id === value)
		if (!museum) return

		setCurrentMuseum(museum)
		fetchData(true, museum)
	}

	return (
		<div className='relative h-screen w-full virtual-page'>
			<Canvas
				key={key}
				shadows>
				<PerspectiveCamera
					makeDefault
					fov={75}
					position={[0, 2, 5]}
				/>
				<Scene
					museumItems={museumItems}
					artworks={artworks}
					onAnimationComplete={() => setAnimationComplete(true)}
					isPaused={isPaused}
					speed={speed}
					targetPosition={targetPosition}
					lookAtPosition={lookAtPosition}
					handlePaintingClick={handlePaintingClick}
					resetAnimation={resetAnimation}
					setOrbitEnabled={setOrbitEnabled}
					isMoving={isMoving}
					setIsMoving={setIsMoving}
					selectedPainting={selectedPainting}
					cursorRef={cursorRef} // Pasamos cursorRef al componente Scene
					cardRef={cardRef} // Pasamos cardRef al componente Scene
				/>
				{orbitEnabled && (
					<OrbitControls
						enablePan={false}
						enableZoom={true}
						enableDamping
						dampingFactor={0.2}
						rotateSpeed={0.5}
						zoomSpeed={0.5}
						panSpeed={0.5}
						target={lookAtPosition || new THREE.Vector3(0, 0, 0)}
						maxZoom={1}
						minZoom={0}
						minDistance={1}
						maxDistance={10}
						minAzimuthAngle={minAzimuthAngle}
						maxAzimuthAngle={maxAzimuthAngle}
						minPolarAngle={minPolarAngle}
						maxPolarAngle={maxPolarAngle}
					/>
				)}
			</Canvas>

			{targetPosition && (
				<div className='absolute animate-pulse top-24 right-4 bg-white/80 rounded-lg px-2 py-0.5'>
					<span>Vista desbloqueada</span>
				</div>
			)}

			{museums.length > 0 && (
				<div className='absolute bottom-4 left-2'>
					<div className='opacity-50 hover:opacity-100 transition-opacity duration-300'>
						<Select
							value={currentMuseum?.id}
							onValueChange={value => {
								handleClickMuseum(value)
							}}>
							<SelectTrigger isUp={true}>
								{currentMuseum?.title || 'Selecciona un museo'}
							</SelectTrigger>
							<SelectContent className='bg-white shadow-lg rounded-md'>
								{museums.map(
									museum =>
										museum.visible && (
											<SelectItem
												key={museum.id}
												value={museum.id}>
												{museum.title}
											</SelectItem>
										)
								)}
							</SelectContent>
						</Select>
					</div>
				</div>
			)}

			<div className='absolute group bottom-4 right-2'>
				{!targetPosition && (
					<div className='flex space-x-2'>
						<button
							title='Reiniciar'
							onClick={handleReset}
							className='bg-white text-black px-4 py-2 rounded-md shadow-lg opacity-10 group-hover:opacity-100 hover:bg-gray-100 transition-all duration-300'>
							<RefreshCwIcon className='w-6 h-6' />
						</button>
						<button
							title={isPaused ? 'Reanudar' : 'Pausar'}
							onClick={handlePause}
							className='bg-white text-black px-4 py-2 rounded-md shadow-lg opacity-10 group-hover:opacity-100 hover:bg-gray-100 transition-all duration-300'>
							{isPaused ? (
								<PlayIcon className='w-6 h-6' />
							) : (
								<PauseIcon className='w-6 h-6' />
							)}
						</button>
						<button
							title='Cambiar velocidad'
							onClick={handleSpeedChange}
							className='bg-white text-black px-4 py-2 rounded-md shadow-lg opacity-10 group-hover:opacity-100 hover:bg-gray-100 transition-all duration-300'>
							x{speedOptions[speedIndex]}
						</button>
					</div>
				)}
				{targetPosition && (
					<button
						onClick={handleReset}
						className='bg-white animate-bounce text-black px-4 py-2 opacity-10 hover:opacity-100 rounded-md shadow-lg hover:bg-gray-100 transition-all'>
						<ArrowLeftIcon className='w-6 h-6' />
					</button>
				)}
			</div>
			<div
				ref={cursorRef}
				className='cursor'></div>
			<div
				ref={trailRef}
				className='cursor-trail'></div>
			<div
				ref={cardRef}
				className='card'></div>
		</div>
	)
}
