import React, { useState } from 'react'
import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from 'react-beautiful-dnd'

const reorder = (list: any[], startIndex: number, endIndex: number) => {
	const result = Array.from(list)
	const [removed] = result.splice(startIndex, 1)
	result.splice(endIndex, 0, removed)

	return result
}

const SimpleDragDrop = () => {
	const [items, setItems] = useState(
		[...Array(5)].map((_, index) => ({
			id: `item-${index + 1}`,
			content: `Item ${index + 1}`,
		}))
	)

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return

		const reorderedItems = reorder(
			items,
			result.source.index,
			result.destination.index
		)
		setItems(reorderedItems)
	}

	return (
		<div>
			<h2>Simple Drag and Drop</h2>
			<DragDropContext onDragEnd={handleDragEnd}>
				<Droppable
					droppableId='droppable'
					direction='vertical'>
					{provided => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							style={{
								padding: '20px',
								background: '#f0f0f0',
								width: '300px',
							}}>
							{items.map((item, index) => (
								<Draggable
									key={item.id}
									draggableId={item.id}
									index={index}>
									{provided => (
										<div
											ref={provided.innerRef}
											{...provided.draggableProps}
											{...provided.dragHandleProps}
											style={{
												padding: '10px',
												margin: '0 0 10px 0',
												background: '#fff',
												border: '1px solid #ccc',
												borderRadius: '4px',
												...provided.draggableProps.style,
											}}>
											{item.content}
										</div>
									)}
								</Draggable>
							))}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</div>
	)
}

export default SimpleDragDrop
