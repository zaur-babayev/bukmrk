import {
  Box,
  VStack,
  Heading,
  IconButton,
  Input,
  HStack,
  useDisclosure,
  Button,
  Divider,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { FiFolder, FiInbox } from 'react-icons/fi'
import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'

function FolderList({ 
  folders, 
  onCreateFolder, 
  onSelectFolder, 
  selectedFolderId, 
  isMovingBookmarks,
  setIsMovingBookmarks 
}) {
  const [newFolderName, setNewFolderName] = useState('')
  const { isOpen, onToggle } = useDisclosure()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      onToggle()
    }
  }

  const handleFolderClick = (folderId) => {
    onSelectFolder(folderId)
    if (isMovingBookmarks) {
      setIsMovingBookmarks(false)
    }
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box 
        bg="white" 
        p={4} 
        borderRadius="lg" 
        shadow="sm"
        borderWidth="1px"
        backdropFilter="blur(8px)"
        transition="all 0.2s"
      >
        <VStack align="stretch" spacing={2}>
          <Heading size="sm" mb={2}>Sections</Heading>
          
          <Button
            variant={selectedFolderId === 'root' ? "solid" : "ghost"}
            justifyContent="flex-start"
            onClick={() => handleFolderClick('root')}
            w="full"
            h="36px"
            fontWeight="normal"
          >
            All Bookmarks
          </Button>

          <Droppable droppableId="folder-inbox">
            {(provided, snapshot) => (
              <Button
                ref={provided.innerRef}
                {...provided.droppableProps}
                variant={selectedFolderId === 'inbox' ? "solid" : "ghost"}
                justifyContent="flex-start"
                leftIcon={<FiInbox />}
                onClick={() => handleFolderClick('inbox')}
                w="full"
                h="36px"
                fontWeight="normal"
                bg={snapshot.isDraggingOver ? "blue.50" : undefined}
                borderWidth={snapshot.isDraggingOver ? "2px" : "0px"}
                borderColor={snapshot.isDraggingOver ? "blue.500" : undefined}
                transition="all 0.2s"
              >
                Inbox
                {provided.placeholder}
              </Button>
            )}
          </Droppable>

          <Divider my={2} />

          {folders.map((folder) => (
            <Droppable key={folder.id} droppableId={`folder-${folder.id}`}>
              {(provided, snapshot) => (
                <Button
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  leftIcon={<FiFolder />}
                  variant={selectedFolderId === folder.id ? "solid" : "ghost"}
                  justifyContent="flex-start"
                  onClick={() => handleFolderClick(folder.id)}
                  w="full"
                  h="36px"
                  fontWeight="normal"
                  bg={snapshot.isDraggingOver ? "blue.50" : undefined}
                  borderWidth={snapshot.isDraggingOver ? "2px" : "0px"}
                  borderColor={snapshot.isDraggingOver ? "blue.500" : undefined}
                  transition="all 0.2s"
                >
                  {folder.name}
                  {provided.placeholder}
                </Button>
              )}
            </Droppable>
          ))}

          {isOpen ? (
            <form onSubmit={handleSubmit}>
              <HStack>
                <Input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  size="sm"
                  autoFocus
                />
                <Button type="submit" size="sm" colorScheme="blue">
                  Add
                </Button>
              </HStack>
            </form>
          ) : (
            <Button
              leftIcon={<AddIcon boxSize="3" />}
              onClick={onToggle}
              variant="ghost"
              justifyContent="flex-start"
              w="full"
              h="36px"
              color="gray.500"
              fontSize="sm"
              fontWeight="normal"
              _hover={{
                bg: 'gray.50',
                color: 'gray.700'
              }}
            >
              New Folder
            </Button>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}

export default FolderList