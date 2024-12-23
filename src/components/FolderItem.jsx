import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Input,
  HStack,
  Portal,
} from '@chakra-ui/react'
import { FiFolder, FiMoreVertical } from 'react-icons/fi'
import { useState, useRef, useEffect } from 'react'
import { Droppable } from '@hello-pangea/dnd'

function FolderItem({ 
  folder, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete,
  isMovingBookmarks 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(folder.name)
  const [menuPosition, setMenuPosition] = useState(null)
  const inputRef = useRef(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const closeTimeoutRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  const handleEdit = () => {
    setIsEditing(true)
    onClose()
  }

  const handleSave = () => {
    if (editedName.trim() && editedName !== folder.name) {
      onEdit(folder.id, editedName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditedName(folder.name)
    }
  }

  const handleContextMenu = (e) => {
    if (window.matchMedia('(pointer: fine)').matches) {
      e.preventDefault()
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      setMenuPosition({ x: e.clientX, y: e.clientY })
      onOpen()
    }
  }

  const handleCloseMenu = () => {
    onClose()
    // Clear position after animation completes
    closeTimeoutRef.current = setTimeout(() => {
      setMenuPosition(null)
    }, 200) // Match this with Chakra's animation duration
  }

  return (
    <Droppable droppableId={`folder-${folder.id}`}>
      {(provided, snapshot) => (
        <div onContextMenu={handleContextMenu}>
          {isEditing ? (
            <HStack px={2}>
              <Input
                ref={inputRef}
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                size="sm"
                autoFocus
              />
            </HStack>
          ) : (
            <HStack w="full" spacing={0} position="relative">
              <Button
                ref={provided.innerRef}
                {...provided.droppableProps}
                leftIcon={<FiFolder />}
                variant={isSelected ? "solid" : "ghost"}
                justifyContent="flex-start"
                onClick={() => onSelect(folder.id)}
                w="full"
                h="36px"
                fontWeight="normal"
                bg={snapshot.isDraggingOver ? "blue.50" : undefined}
                borderWidth={snapshot.isDraggingOver ? "2px" : "0px"}
                borderColor={snapshot.isDraggingOver ? "blue.500" : undefined}
                transition="all 0.2s"
              >
                <span>{folder.name}</span>
                {provided.placeholder}
              </Button>
              
              <Menu 
                isOpen={isOpen} 
                onClose={handleCloseMenu}
              >
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                    }
                    setMenuPosition(null);
                    onOpen();
                  }}
                  display={{ base: 'flex', md: window.matchMedia('(pointer: fine)').matches ? 'none' : 'flex' }}
                  position="absolute"
                  right={2}
                  zIndex={1}
                />
                <Portal>
                  <MenuList
                    zIndex={1002}
                    {...(menuPosition ? {
                      position: "fixed",
                      left: `${menuPosition.x}px`,
                      top: `${menuPosition.y}px`
                    } : {})}
                  >
                    <MenuItem onClick={handleEdit}>Rename</MenuItem>
                    <MenuItem onClick={() => onDelete(folder.id)} color="red.500">
                      Delete
                    </MenuItem>
                  </MenuList>
                </Portal>
              </Menu>
            </HStack>
          )}
        </div>
      )}
    </Droppable>
  )
}

export default FolderItem 
