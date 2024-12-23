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
  useToast,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { FiInbox } from 'react-icons/fi'
import { useState } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import FolderItem from './FolderItem'

function FolderList({ 
  folders, 
  onCreateFolder, 
  onSelectFolder, 
  selectedFolderId,
  onEditFolder,
  onDeleteFolder,
  isMovingBookmarks,
  setIsMovingBookmarks 
}) {
  const [newFolderName, setNewFolderName] = useState('')
  const { isOpen, onToggle } = useDisclosure()
  const toast = useToast()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      onToggle()
    }
  }

  const handleDeleteFolder = (folderId) => {
    onDeleteFolder(folderId)
    toast({
      title: "Folder deleted",
      status: "success",
      duration: 2000,
    })
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Box 
        bg="white" 
        p={4} 
        borderRadius="lg" 
        shadow="sm"
        borderWidth="1px"
      >
        <VStack align="stretch" spacing={2}>
          <Heading size="sm" mb={2}>Sections</Heading>
          
          <Button
            variant={selectedFolderId === 'root' ? "solid" : "ghost"}
            justifyContent="flex-start"
            onClick={() => onSelectFolder('root')}
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
                onClick={() => onSelectFolder('inbox')}
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
            <FolderItem
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              onSelect={onSelectFolder}
              onEdit={onEditFolder}
              onDelete={handleDeleteFolder}
              isMovingBookmarks={isMovingBookmarks}
            />
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