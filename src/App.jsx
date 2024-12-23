import { ChakraProvider, Container, useToast } from '@chakra-ui/react'
import BookmarkForm from './components/BookmarkForm'
import BookmarkList from './components/BookmarkList'
import { useState, useEffect } from 'react'
import { db } from './firebase'
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc,
  doc 
} from 'firebase/firestore'
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800'
      }
    }
  }
})

function App() {
  const [bookmarks, setBookmarks] = useState([])
  const toast = useToast()

  useEffect(() => {
    // Set up real-time listener for bookmarks
    const unsubscribe = onSnapshot(
      collection(db, 'bookmarks'),
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

  const addBookmark = async (bookmark) => {
    try {
      await addDoc(collection(db, 'bookmarks'), {
        ...bookmark,
        createdAt: new Date().toISOString()
      })
      toast({
        title: "Bookmark added",
        status: "success",
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast({
        title: "Error adding bookmark",
        status: "error",
        duration: 3000,
        isClosable: true,
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

  return (
    <ChakraProvider theme={theme}>
      <Container maxW="container.lg" py={8}>
        <BookmarkForm onSubmit={addBookmark} />
        <BookmarkList 
          bookmarks={bookmarks} 
          onDelete={deleteBookmark}
        />
      </Container>
    </ChakraProvider>
  )
}

export default App 