import {
  Box,
  Heading,
  Link,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Checkbox,
  Button,
  Alert,
  AlertIcon,
  Wrap,
  WrapItem,
  Tooltip,
} from '@chakra-ui/react'
import { DeleteIcon, CloseIcon, ExternalLinkIcon, TimeIcon } from '@chakra-ui/icons'
import { FiArrowRight, FiFolder } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { useState } from 'react'

function BookmarkList({ bookmarks, onDelete, onBulkAction, isMovingBookmarks, setIsMovingBookmarks, folders }) {
  const [selectedBookmarks, setSelectedBookmarks] = useState([])

  const handleSelect = (bookmarkId) => {
    if (isMovingBookmarks) return // Disable selection while moving
    setSelectedBookmarks(prev => 
      prev.includes(bookmarkId)
        ? prev.filter(id => id !== bookmarkId)
        : [...prev, bookmarkId]
    )
  }

  const handleBulkAction = (action) => {
    onBulkAction(action, selectedBookmarks)
    if (action !== 'move') {
      setSelectedBookmarks([])
    }
  }

  const getFolderName = (folderId) => {
    const folder = folders.find(f => f.id === folderId)
    return folder ? folder.name : null
  }

  return (
    <VStack spacing={6} align="stretch">
      {isMovingBookmarks ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>Select a folder to move {selectedBookmarks.length} bookmark(s)</Text>
          <Button
            size="sm"
            leftIcon={<CloseIcon />}
            ml="auto"
            variant="ghost"
            onClick={() => {
              setIsMovingBookmarks(false)
              setSelectedBookmarks([])
            }}
          >
            Cancel Move
          </Button>
        </Alert>
      ) : (
        selectedBookmarks.length > 0 && (
          <HStack justify="flex-end" spacing={4} p={2} bg="white" borderRadius="md" shadow="sm">
            <Button
              leftIcon={<FiArrowRight />}
              onClick={() => handleBulkAction('move')}
              colorScheme="blue"
              size="sm"
            >
              Move to Folder
            </Button>
            <Button
              leftIcon={<DeleteIcon />}
              onClick={() => handleBulkAction('delete')}
              colorScheme="red"
              size="sm"
            >
              Delete Selected
            </Button>
          </HStack>
        )
      )}
      
      <Droppable droppableId="bookmarks">
        {(provided) => (
          <VStack 
            spacing={4} 
            align="stretch"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {bookmarks.map((bookmark, index) => (
              <Draggable key={bookmark.id} draggableId={bookmark.id} index={index}>
                {(provided, snapshot) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    p={4}
                    shadow={snapshot.isDragging ? "lg" : "sm"}
                    borderWidth="1px"
                    borderRadius="lg"
                    bg="white"
                    opacity={snapshot.isDragging ? 0.6 : 1}
                    _hover={{ shadow: 'md', borderColor: 'blue.200' }}
                    transition="all 0.2s"
                    position="relative"
                  >
                    <Checkbox 
                      position="absolute"
                      top={4}
                      left={4}
                      isChecked={selectedBookmarks.includes(bookmark.id)}
                      onChange={() => handleSelect(bookmark.id)}
                      colorScheme="blue"
                    />
                    <IconButton
                      position="absolute"
                      top={4}
                      right={4}
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(bookmark.id)}
                      aria-label="Delete bookmark"
                    />
                    
                    <VStack align="stretch" spacing={2} pl={10} pr={10}>
                      <Heading size="sm" noOfLines={1}>
                        {bookmark.title}
                      </Heading>
                      
                      <Link 
                        href={bookmark.url} 
                        isExternal 
                        color="gray.500"
                        fontSize="sm"
                        noOfLines={1}
                      >
                        {bookmark.url} <ExternalLinkIcon mx="2px" />
                      </Link>

                      {bookmark.description && (
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {bookmark.description}
                        </Text>
                      )}

                      <Wrap spacing={2} align="center">
                        <WrapItem>
                          <Tooltip label={new Date(bookmark.createdAt).toLocaleString()}>
                            <Box 
                              display="flex" 
                              alignItems="center" 
                              gap={1}
                              color="gray.400" 
                              fontSize="xs"
                              _hover={{ color: "gray.600" }}
                              transition="color 0.2s"
                            >
                              <TimeIcon boxSize={3} />
                              {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                            </Box>
                          </Tooltip>
                        </WrapItem>
                        {bookmark.folderId && getFolderName(bookmark.folderId) && (
                          <WrapItem>
                            <Badge colorScheme="blue" display="flex" alignItems="center" gap={1}>
                              <FiFolder />
                              {getFolderName(bookmark.folderId)}
                            </Badge>
                          </WrapItem>
                        )}
                      </Wrap>
                    </VStack>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </VStack>
        )}
      </Droppable>
    </VStack>
  )
}

export default BookmarkList 