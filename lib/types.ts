export type Artwork = {
	id: string
	title: string
	category: string
	image_url: string
	year: string
	description: string
	medium: string
	dimensions: string
	location: string
}
export type Museum = {
	id: string
	title: string
	visible: boolean
	principal: boolean
	museum_item_ids: string[]
}

export type MuseumItem = {
	id: string
	artwork_id: string | null
	visible: boolean
	index: number
}
