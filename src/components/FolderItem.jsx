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
  Box,
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
  const inputRef = useRef(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const menuRef = useRef()

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleEdit = () => {
    setIsEditing(true)
    onClose()
    setContextMenu(null)
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
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
      })
    }
  }

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null)
    }
    
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu])

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
              position="relative"
            >
              <span>{folder.name}</span>
              {provided.placeholder}
              <Menu isOpen={isOpen} onClose={onClose}>
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  variant="ghost"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onOpen()
                  }}
                  display={{ base: 'flex', md: window.matchMedia('(pointer: fine)').matches ? 'none' : 'flex' }}
                  position="absolute"
                  right={2}
                />
                <Portal>
                  <MenuList zIndex={1002}>
                    <MenuItem onClick={handleEdit}>Rename</MenuItem>
                    <MenuItem onClick={() => onDelete(folder.id)} color="red.500">
                      Delete
                    </MenuItem>
                  </MenuList>
                </Portal>
              </Menu>
            </Button>
          )}

          {/* Context menu for desktop */}
          {contextMenu && (
            <Portal>
              <Box
                position="fixed"
                left={contextMenu.x}
                top={contextMenu.y}
                bg="white"
                boxShadow="md"
                borderRadius="md"
                borderWidth="1px"
                zIndex={1000}
              >
                <Button
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  px={4}
                  py={2}
                  onClick={handleEdit}
                  fontWeight="normal"
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  w="full"
                  justifyContent="flex-start"
                  px={4}
                  py={2}
                  color="red.500"
                  fontWeight="normal"
                  onClick={() => {
                    onDelete(folder.id)
                    setContextMenu(null)
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Portal>
          )}
        </div>
      )}
    </Droppable>
  )
}

export default FolderItem 