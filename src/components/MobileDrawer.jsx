import {
  IconButton,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { HamburgerIcon } from '@chakra-ui/icons'
import FolderList from './FolderList'
import { useState, useEffect, useRef } from 'react'

function MobileDrawer({ 
  folders, 
  onCreateFolder, 
  onSelectFolder, 
  selectedFolderId, 
  isMovingBookmarks, 
  setIsMovingBookmarks,
  onEditFolder,
  onDeleteFolder 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const drawerRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      // Ignore clicks on the button itself
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return
      }
      
      // Close if clicking outside the drawer
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleFolderSelect = (folderId) => {
    onSelectFolder(folderId)
    setIsOpen(false)
  }

  return (
    <>
      <IconButton
        ref={buttonRef}
        display={{ base: 'flex', md: 'none' }}
        icon={<HamburgerIcon />}
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        color="black"
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
        position="absolute"
        left="0"
        top="0"
        height="40px"
        zIndex={1002}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={drawerRef}
            initial={{ x: -300, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
                opacity: { duration: 0.2 }
              }
            }}
            exit={{ 
              x: -300, 
              opacity: 0,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 200,
                opacity: { duration: 0.2 }
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              width: '250px',
              padding: '96px 16px 16px 16px',
            //   backgroundColor: 'white',
            //   boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              zIndex: 1001,
            }}
          >
            <FolderList
              folders={folders}
              onCreateFolder={onCreateFolder}
              onSelectFolder={handleFolderSelect}
              selectedFolderId={selectedFolderId}
              isMovingBookmarks={isMovingBookmarks}
              setIsMovingBookmarks={setIsMovingBookmarks}
              onEditFolder={onEditFolder}
              onDeleteFolder={onDeleteFolder}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileDrawer 