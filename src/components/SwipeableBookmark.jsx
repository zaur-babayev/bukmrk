import { useState, useRef, useEffect } from 'react'
import { Box, IconButton, HStack } from '@chakra-ui/react'
import { useSwipeable } from 'react-swipeable'
import { DeleteIcon, ArrowForwardIcon } from '@chakra-ui/icons'

const SWIPE_THRESHOLD = 50
const ACTION_WIDTH = 80

// Helper function to detect touch device
const isTouchDevice = () => {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
}

export default function SwipeableBookmark({ 
  children, 
  onDelete, 
  onMove, 
  isMovingBookmarks,
  dragHandleProps 
}) {
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const startXRef = useRef(0)
  const isTouchDeviceRef = useRef(isTouchDevice())

  useEffect(() => {
    if (!isDragging && Math.abs(offset) < SWIPE_THRESHOLD) {
      setOffset(0)
    } else if (!isDragging && offset < -SWIPE_THRESHOLD) {
      setOffset(-ACTION_WIDTH)
    }
  }, [isDragging, offset])

  const handlers = useSwipeable({
    onSwipeStart: (e) => {
      if (isMovingBookmarks || !isTouchDeviceRef.current) return
      const touch = e.event
      if (Math.abs(touch.movementX) > Math.abs(touch.movementY)) {
        setIsSwipeActive(true)
        setIsDragging(true)
        startXRef.current = e.initial[0]
      }
    },
    onSwiping: (e) => {
      if (isMovingBookmarks || !isSwipeActive || !isTouchDeviceRef.current) return
      const deltaX = e.deltaX
      const newOffset = Math.max(-ACTION_WIDTH, Math.min(0, deltaX))
      setOffset(newOffset)
    },
    onSwipeEnd: () => {
      if (isMovingBookmarks || !isTouchDeviceRef.current) return
      setIsDragging(false)
      setIsSwipeActive(false)
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 10,
  })

  const handleDelete = () => {
    onDelete()
    setOffset(0)
  }

  const handleMove = () => {
    onMove()
    setOffset(0)
  }

  // If not a touch device, render with delete button
  if (!isTouchDeviceRef.current) {
    return (
      <Box {...dragHandleProps} position="relative" role="group">
        <Box
          _hover={{ 
            '& > *:first-of-type': {
              transform: 'translateY(-1px)',
              boxShadow: 'md',
            }
          }}
        >
          {children}
        </Box>
        <IconButton
          icon={<DeleteIcon />}
          variant="ghost"
          size="sm"
          position="absolute"
          top={4}
          right={4}
          onClick={handleDelete}
          visibility="hidden"
          bg="white"
          color="black"
          _groupHover={{ 
            visibility: 'visible'
          }}
          _hover={{
            bg: 'gray.100'
          }}
          aria-label="Delete bookmark"
        />
      </Box>
    )
  }

  return (
    <Box 
      position="relative" 
      overflow="hidden"
      {...(isSwipeActive ? handlers : {})}
      onTouchStart={(e) => {
        if (!isTouchDeviceRef.current) return
        const touch = e.touches[0]
        const touchX = touch.clientX
        const touchY = touch.clientY
        
        const handleTouchMove = (e) => {
          const moveX = e.touches[0].clientX - touchX
          const moveY = e.touches[0].clientY - touchY
          
          if (Math.abs(moveX) > Math.abs(moveY)) {
            setIsSwipeActive(true)
          }
          document.removeEventListener('touchmove', handleTouchMove)
        }
        
        document.addEventListener('touchmove', handleTouchMove, { once: true })
      }}
    >
      <Box
        {...dragHandleProps}
        transform={`translateX(${offset}px)`}
        transition={isDragging ? 'none' : 'transform 0.2s ease-out'}
        _hover={{ 
          '& > *': {
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          }
        }}
      >
        {children}
      </Box>
      
      {/* Action buttons container */}
      <HStack
        position="absolute"
        top={0}
        right={0}
        height="100%"
        spacing={0}
        opacity={Math.abs(offset) > 0 ? 1 : 0}
        transition="opacity 0.2s"
        pointerEvents={Math.abs(offset) > SWIPE_THRESHOLD ? 'auto' : 'none'}
      >
        <IconButton
          icon={<ArrowForwardIcon />}
          colorScheme="blue"
          variant="solid"
          height="100%"
          borderRadius="0"
          onClick={handleMove}
          aria-label="Move bookmark"
        />
        <IconButton
          icon={<DeleteIcon />}
          colorScheme="red"
          variant="solid"
          height="100%"
          borderRadius="0"
          onClick={handleDelete}
          aria-label="Delete bookmark"
        />
      </HStack>
    </Box>
  )
}
