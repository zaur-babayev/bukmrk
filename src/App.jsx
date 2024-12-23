import { ChakraProvider, Container, useToast, Button } from '@chakra-ui/react'
import BookmarkForm from './components/BookmarkForm'
import BookmarkList from './components/BookmarkList'
import { useState, useEffect, useMemo } from 'react'
import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc,
  doc,
  writeBatch,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore'
import { extendTheme } from '@chakra-ui/react'
import { DragDropContext } from '@hello-pangea/dnd'
import FolderList from './components/FolderList'
import { HStack, Box, VStack } from '@chakra-ui/react'
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import MobileDrawer from './components/MobileDrawer'

const theme = extendTheme({
  fonts: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Space Grotesk', sans-serif",
  },
  colors: {
    monochrome: {
      50: '#FFFFFF',
      100: '#FAFAFA',
      200: '#EAEAEA',
      300: '#999999',
      400: '#888888',
      500: '#666666',
      600: '#444444',
      700: '#333333',
      800: '#222222',
      900: '#111111'
    }
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'monochrome.100',
        color: 'monochrome.900'
      }
    }
  },
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
      variants: {
        solid: {
          bg: 'monochrome.900',
          color: 'white',
          _hover: {
            bg: 'monochrome.700',
          }
        },
        ghost: {
          _hover: {
            bg: 'monochrome.100',
          }
        }
      }
    },
    Input: {
      defaultProps: {
        size: 'sm',
      },
      variants: {
        outline: {
          field: {
            borderColor: 'monochrome.200',
            _hover: {
              borderColor: 'monochrome.300',
            },
            _focus: {
              borderColor: 'monochrome.900',
              boxShadow: '0 0 0 1px var(--chakra-colors-monochrome-900)',
            }
          }
        }
      }
    },
    FormLabel: {
      baseStyle: {
        fontSize: 'sm',
        fontWeight: 'medium',
        color: 'monochrome.700',
      },
    },
    Badge: {
      baseStyle: {
        px: 2,
        py: 1,
        borderRadius: 'full',
      },
      variants: {
        solid: {
          bg: 'monochrome.900',
          color: 'white',
        }
      }
    },
  },
})

function BookmarkManager({ bookmarks, folders, selectedFolderId, setSelectedFolderId, ...props }) {
  const { folderName } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (window.location.pathname === '/inbox') {
      setSelectedFolderId('inbox')
    } else if (folderName) {
      const folder = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase())
      setSelectedFolderId(folder ? folder.id : 'root')
    } else {
      setSelectedFolderId('root')
    }
  }, [folderName, folders, setSelectedFolderId, window.location.pathname])

  const handleFolderSelect = (folderId) => {
    if (props.isMovingBookmarks) {
      props.moveBookmarksToFolder(folderId)
    } else {
      if (folderId === 'inbox') {
        navigate('/inbox')
      } else if (folderId === 'root') {
        navigate('/')
      } else {
        const folder = folders.find(f => f.id === folderId)
        navigate(folder ? `/folder/${folder.name}` : '/')
      }
    }
  }

  const handleDeleteFolder = async (folderId) => {
    await props.deleteFolder(folderId)
    if (selectedFolderId === folderId) {
      navigate('/inbox')
    }
  }

  return (
    <VStack align="stretch" spacing={8}>
      <Box position="relative" width="100%">
        <Box ml={{ base: '40px', md: 0 }}>
          <BookmarkForm onSubmit={props.addBookmark} folders={folders} />
        </Box>
        <MobileDrawer
          folders={folders}
          onCreateFolder={props.createFolder}
          onSelectFolder={handleFolderSelect}
          selectedFolderId={selectedFolderId}
          isMovingBookmarks={props.isMovingBookmarks}
          setIsMovingBookmarks={props.setIsMovingBookmarks}
          onEditFolder={props.editFolder}
          onDeleteFolder={handleDeleteFolder}
        />
      </Box>
      <HStack align="start" spacing={8}>
        <Box w="250px" display={{ base: 'none', md: 'block' }}>
          <FolderList
            folders={folders}
            onCreateFolder={props.createFolder}
            onEditFolder={props.editFolder}
            onDeleteFolder={handleDeleteFolder}
            onSelectFolder={handleFolderSelect}
            selectedFolderId={selectedFolderId}
            isMovingBookmarks={props.isMovingBookmarks}
            setIsMovingBookmarks={props.setIsMovingBookmarks}
          />
        </Box>
        <Box flex={1}>
          <BookmarkList 
            bookmarks={props.filteredBookmarks}
            onDelete={props.deleteBookmark}
            onBulkAction={props.handleBulkAction}
            isMovingBookmarks={props.isMovingBookmarks}
            setIsMovingBookmarks={props.setIsMovingBookmarks}
            folders={folders}
          />
        </Box>
      </HStack>
    </VStack>
  )
}

function App() {
  const [bookmarks, setBookmarks] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedFolderId, setSelectedFolderId] = useState('root')
  const [isMovingBookmarks, setIsMovingBookmarks] = useState(false)
  const [selectedBookmarksToMove, setSelectedBookmarksToMove] = useState([])
  const toast = useToast()

  useEffect(() => {
    // Set up real-time listener for bookmarks
    const unsubscribe = onSnapshot(
      query(collection(db, 'bookmarks'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const bookmarksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setBookmarks(bookmarksData)
      },
      (error) => {
        console.error("Error fetching bookmarks:", error)
        toast({
          title: "Error fetching bookmarks",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [toast])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'folders'),
      (snapshot) => {
        const foldersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setFolders(foldersData)
      }
    )
    return () => unsubscribe()
  }, [])

  const createFolder = async (name) => {
    if (!name || typeof name !== 'string') return null;
    
    try {
      const docRef = await addDoc(collection(db, 'folders'), {
        name,
        createdAt: new Date().toISOString()
      })
      
      // Return the created folder with its ID
      const newFolder = {
        id: docRef.id,
        name,
        createdAt: new Date().toISOString()
      }
      
      toast({
        title: "Folder created",
        status: "success",
        duration: 2000,
      })
      
      return newFolder
    } catch (error) {
      console.error('Error creating folder:', error)
      toast({
        title: "Error creating folder",
        status: "error",
        duration: 3000,
      })
      return null
    }
  }

  const addBookmark = async (bookmark) => {
    try {
      let targetFolder = null
      
      // Handle hashtags if present
      if (bookmark.hashtags && bookmark.hashtags.length > 0) {
        console.log('Processing hashtags:', bookmark.hashtags) // Debug log
        
        // Process each hashtag in order
        for (const folderName of bookmark.hashtags) {
          console.log('Processing folder:', folderName) // Debug log
          
          const existingFolder = folders.find(f => f.name.toLowerCase() === folderName.toLowerCase())
          if (existingFolder) {
            console.log('Found existing folder:', existingFolder) // Debug log
            targetFolder = existingFolder
          } else {
            console.log('Creating new folder:', folderName) // Debug log
            const newFolder = await createFolder(folderName)
            if (newFolder) {
              console.log('Created new folder:', newFolder) // Debug log
              targetFolder = newFolder
            }
          }
        }
      }
      
      // Add the bookmark
      const bookmarkData = {
        url: bookmark.url,
        title: bookmark.title,
        description: bookmark.description,
        image: bookmark.image,
        folderId: targetFolder ? targetFolder.id : 
                 (selectedFolderId !== 'root' && selectedFolderId !== 'inbox' ? selectedFolderId : null),
        createdAt: new Date().toISOString()
      }
      
      console.log('Adding bookmark with data:', bookmarkData) // Debug log
      
      await addDoc(collection(db, 'bookmarks'), bookmarkData)

      toast({
        title: "Bookmark added",
        status: "success",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast({
        title: "Error adding bookmark",
        description: error.message,
        status: "error",
        duration: 3000,
      })
    }
  }

  const deleteBookmark = async (id) => {
    try {
      await deleteDoc(doc(db, 'bookmarks', id))
      toast({
        title: "Bookmark deleted",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast({
        title: "Error deleting bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleBulkAction = async (action, bookmarkIds) => {
    switch (action) {
      case 'delete':
        await handleBulkDelete(bookmarkIds)
        break
      case 'move':
        setSelectedBookmarksToMove(bookmarkIds)
        setIsMovingBookmarks(true)
        break
      case 'tag':
        // We'll implement tags in the next step
        break
      default:
        console.error('Unknown bulk action:', action)
    }
  }

  const handleBulkDelete = async (bookmarkIds) => {
    try {
      const batch = writeBatch(db)
      bookmarkIds.forEach(id => {
        batch.delete(doc(db, 'bookmarks', id))
      })
      await batch.commit()
      toast({
        title: `${bookmarkIds.length} bookmarks deleted`,
        status: "success",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error deleting bookmarks:', error)
      toast({
        title: "Error deleting bookmarks",
        status: "error",
        duration: 3000,
      })
    }
  }

  const moveBookmarksToFolder = async (targetFolderId) => {
    try {
      const batch = writeBatch(db)
      selectedBookmarksToMove.forEach(id => {
        const bookmarkRef = doc(db, 'bookmarks', id)
        batch.update(bookmarkRef, { 
          folderId: targetFolderId === 'root' || targetFolderId === 'inbox' 
            ? null 
            : targetFolderId 
        })
      })
      
      await batch.commit()
      setIsMovingBookmarks(false)
      setSelectedBookmarksToMove([])
      toast({
        title: `${selectedBookmarksToMove.length} bookmarks moved`,
        status: "success",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error moving bookmarks:', error)
      toast({
        title: "Error moving bookmarks",
        status: "error",
        duration: 3000,
      })
    }
  }

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result
    
    if (!destination) return

    // If dropping into a folder
    if (destination.droppableId.startsWith('folder-')) {
      const targetFolderId = destination.droppableId.replace('folder-', '')
      const batch = writeBatch(db)
      const bookmarkRef = doc(db, 'bookmarks', draggableId)
      
      batch.update(bookmarkRef, { 
        folderId: targetFolderId === 'root' || targetFolderId === 'inbox' 
          ? null 
          : targetFolderId 
      })
      
      batch.commit()
        .then(() => {
          toast({
            title: "Bookmark moved",
            status: "success",
            duration: 2000,
          })
        })
        .catch(error => {
          console.error('Error moving bookmark:', error)
          toast({
            title: "Error moving bookmark",
            status: "error",
            duration: 3000,
          })
        })
      return
    }

    // Handle reordering within the same list
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      return
    }

    // Update order in Firebase
    const newBookmarks = Array.from(bookmarks)
    const [removed] = newBookmarks.splice(source.index, 1)
    newBookmarks.splice(destination.index, 0, removed)

    const batch = writeBatch(db)
    newBookmarks.forEach((bookmark, index) => {
      const bookmarkRef = doc(db, 'bookmarks', bookmark.id)
      batch.update(bookmarkRef, { order: index })
    })
    
    batch.commit().catch(error => {
      console.error('Error updating bookmark order:', error)
      toast({
        title: "Error updating bookmark order",
        status: "error",
        duration: 3000,
      })
    })
  }

  const filteredBookmarks = useMemo(() => {
    if (selectedFolderId === 'inbox') {
      return bookmarks.filter(b => !b.folderId)
    }
    if (selectedFolderId === 'root') {
      return bookmarks
    }
    return bookmarks.filter(b => b.folderId === selectedFolderId)
  }, [bookmarks, selectedFolderId])

  const editFolder = async (folderId, newName) => {
    try {
      const folderRef = doc(db, 'folders', folderId)
      await updateDoc(folderRef, {
        name: newName
      })
      toast({
        title: "Folder renamed",
        status: "success",
        duration: 2000,
      })
    } catch (error) {
      console.error('Error editing folder:', error)
      toast({
        title: "Error renaming folder",
        status: "error",
        duration: 3000,
      })
    }
  }

  const deleteFolder = async (folderId) => {
    try {
      // First update all bookmarks in this folder to have no folder (move to inbox)
      const batch = writeBatch(db)
      const bookmarksToUpdate = bookmarks.filter(b => b.folderId === folderId)
      
      bookmarksToUpdate.forEach(bookmark => {
        const bookmarkRef = doc(db, 'bookmarks', bookmark.id)
        batch.update(bookmarkRef, { folderId: null })
      })
      
      // Delete the folder
      const folderRef = doc(db, 'folders', folderId)
      batch.delete(folderRef)
      
      await batch.commit()
      
      toast({
        title: "Folder deleted",
        description: `${bookmarksToUpdate.length} bookmarks moved to inbox`,
        status: "success",
        duration: 3000,
      })
    } catch (error) {
      console.error('Error deleting folder:', error)
      toast({
        title: "Error deleting folder",
        status: "error",
        duration: 3000,
      })
    }
  }

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={8}>
          <BrowserRouter>
            <DragDropContext onDragEnd={onDragEnd}>
              <Routes>
                <Route path="/" element={
                  <BookmarkManager
                    bookmarks={bookmarks}
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    setSelectedFolderId={setSelectedFolderId}
                    filteredBookmarks={filteredBookmarks}
                    isMovingBookmarks={isMovingBookmarks}
                    setIsMovingBookmarks={setIsMovingBookmarks}
                    createFolder={createFolder}
                    addBookmark={addBookmark}
                    deleteBookmark={deleteBookmark}
                    handleBulkAction={handleBulkAction}
                    moveBookmarksToFolder={moveBookmarksToFolder}
                    editFolder={editFolder}
                    deleteFolder={deleteFolder}
                  />
                } />
                <Route path="/inbox" element={
                  <BookmarkManager
                    bookmarks={bookmarks}
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    setSelectedFolderId={setSelectedFolderId}
                    filteredBookmarks={filteredBookmarks}
                    isMovingBookmarks={isMovingBookmarks}
                    setIsMovingBookmarks={setIsMovingBookmarks}
                    createFolder={createFolder}
                    addBookmark={addBookmark}
                    deleteBookmark={deleteBookmark}
                    handleBulkAction={handleBulkAction}
                    moveBookmarksToFolder={moveBookmarksToFolder}
                    editFolder={editFolder}
                    deleteFolder={deleteFolder}
                  />
                } />
                <Route path="/folder/:folderName" element={
                  <BookmarkManager
                    bookmarks={bookmarks}
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    setSelectedFolderId={setSelectedFolderId}
                    filteredBookmarks={filteredBookmarks}
                    isMovingBookmarks={isMovingBookmarks}
                    setIsMovingBookmarks={setIsMovingBookmarks}
                    createFolder={createFolder}
                    addBookmark={addBookmark}
                    deleteBookmark={deleteBookmark}
                    handleBulkAction={handleBulkAction}
                    moveBookmarksToFolder={moveBookmarksToFolder}
                    editFolder={editFolder}
                    deleteFolder={deleteFolder}
                  />
                } />
                <Route path="*" element={
                  <Box>
                    <VStack spacing={8} align="stretch">
                      <BookmarkForm onSubmit={addBookmark} folders={folders} />
                    </VStack>
                  </Box>
                } />
              </Routes>
            </DragDropContext>
          </BrowserRouter>
        </Container>
      </Box>
    </ChakraProvider>
  )
}

export default App