import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Textarea,
  VStack,
  Image,
  Skeleton,
  Heading,
  HStack,
  Spinner,
  Text,
  Kbd,
  useBreakpointValue,
  IconButton,
  Badge,
  useToast,
  Icon,
  Code
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { CheckIcon, LinkIcon } from '@chakra-ui/icons'
import { FaFolder } from 'react-icons/fa'

function BookmarkForm({ onSubmit, folders }) {
  const [url, setUrl] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    image: '',
    folderId: null,
    hashtags: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [clipboardUrl, setClipboardUrl] = useState(null)
  const [hashtagSuggestions, setHashtagSuggestions] = useState([])
  const [cursorPosition, setCursorPosition] = useState(null)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0)
  const urlInputRef = useRef(null)
  const descriptionInputRef = useRef(null)
  const isMobile = useBreakpointValue({ base: true, md: false })
  const toast = useToast()

  const fetchMetadata = async (url) => {
    try {
      setIsLoading(true)
      const response = await fetch('/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch metadata')
      }

      const metadata = await response.json()
      return metadata
    } catch (error) {
      console.error('Error fetching metadata:', error)
      return {
        title: new URL(url).hostname,
        description: '',
        image: ''
      }
    } finally {
      setIsLoading(false)
    }
  }

  const checkClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text?.startsWith('http') && text !== url && text !== clipboardUrl) {
        setClipboardUrl(text)
      }
    } catch (err) {
      // Clipboard access denied or other error
      console.log('Clipboard access error:', err)
    }
  }

  useEffect(() => {
    if (isMobile) {
      // Removed automatic clipboard check on component mount and focus
      // If needed, add a button or explicit action to check clipboard
    }
  }, [isMobile])

  useEffect(() => {
    // Reset selected index when suggestions change
    setSelectedSuggestionIndex(0)
  }, [hashtagSuggestions])

  const handleHashtagInput = (text, inputElement) => {
    const parts = text.split(' ')
    const lastPart = parts[parts.length - 1]
    
    if (lastPart.startsWith('#')) {
      const searchTerm = lastPart.slice(1).toLowerCase()
      const suggestions = folders
        .filter(folder => folder.name.toLowerCase().includes(searchTerm))
        .map(folder => folder.name)
      
      setHashtagSuggestions(suggestions)
      if (suggestions.length > 0) {
        setCursorPosition({
          top: inputElement.offsetTop + inputElement.offsetHeight,
          left: inputElement.offsetLeft + (text.length * 8)
        })
      } else {
        setCursorPosition(null)
      }
    } else {
      setHashtagSuggestions([])
      setCursorPosition(null)
    }
  }

  const handleSuggestionClick = (folderName) => {
    const parts = url.split(' ')
    // Replace the last part (hashtag) with the selected folder
    const newParts = [...parts.slice(0, -1), '#' + folderName]
    const newUrl = newParts.join(' ') + ' '
    setUrl(newUrl)
    setHashtagSuggestions([])
    setCursorPosition(null)
    if (urlInputRef.current) {
      urlInputRef.current.focus()
    }
  }

  const handlePaste = async (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData?.getData('text')
    if (pastedText?.startsWith('http')) {
      setUrl(pastedText)
      if (urlInputRef.current) {
        setTimeout(() => {
          urlInputRef.current.focus()
          urlInputRef.current.setSelectionRange(pastedText.length, pastedText.length)
          urlInputRef.current.scrollLeft = urlInputRef.current.scrollWidth
        }, 0)
      }
      await handleUrlSubmit(pastedText)
    }
  }

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault()
    }
    
    // Only proceed if we have a URL
    if (!url.trim()) return
    
    if (isExpanded) {
      const { hashtags } = extractUrlAndTags(url)
      onSubmit({
        ...formData,
        url: extractUrlAndTags(url).url,
        hashtags
      })
      setFormData({ url: '', title: '', description: '', image: '', folderId: null, hashtags: [] })
      setUrl('')
      setIsExpanded(false)
      setHashtagSuggestions([])
      setCursorPosition(null)
    } else {
      handleUrlSubmit(url)
    }
  }

  const extractUrlAndTags = (input) => {
    const parts = input.trim().split(' ')
    const urlPart = parts[0]
    const hashtags = parts
      .slice(1)
      .filter(part => part.startsWith('#'))
      .map(tag => tag.substring(1))
    
    return { url: urlPart, hashtags }
  }

  const handleUrlSubmit = async (submittedUrl) => {
    const { url: cleanUrl, hashtags } = extractUrlAndTags(submittedUrl)
    if (!cleanUrl?.startsWith('http')) return
    
    setIsLoading(true)
    setFormData(prev => ({ 
      ...prev, 
      url: cleanUrl,
      hashtags
    }))
    
    try {
      const metadata = await fetchMetadata(cleanUrl)
      setFormData(prev => ({
        ...prev,
        title: metadata.title || '',
        description: metadata.description || '',
        image: metadata.image || '',
        hashtags // Preserve hashtags from URL
      }))
      // Keep the original URL with hashtags in the input field
      setUrl(submittedUrl)
      setIsExpanded(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnterKey = (e) => {
    e.preventDefault()
    
    // If there are suggestions and we're in the middle of typing a hashtag
    if (hashtagSuggestions.length > 0) {
      const parts = url.split(' ')
      const lastPart = parts[parts.length - 1]
      
      if (lastPart.startsWith('#')) {
        const tagName = lastPart.slice(1)
        
        // If the typed tag exactly matches a suggestion, use it
        const exactMatch = hashtagSuggestions.find(
          s => s.toLowerCase() === tagName.toLowerCase()
        )
        
        // If the typed tag partially matches a suggestion, use the first suggestion
        const partialMatch = hashtagSuggestions[0]
        
        if (exactMatch || partialMatch) {
          handleSuggestionClick(exactMatch || partialMatch)
          return
        }
      }
    }
    
    // If no suggestions or not typing a hashtag, submit the form
    handleSubmit(e)
  }

  const handleClipboardSuggestion = async () => {
    if (clipboardUrl) {
      setUrl(clipboardUrl)
      setClipboardUrl(null)
      if (urlInputRef.current) {
        urlInputRef.current.focus()
      }
      await handleUrlSubmit(clipboardUrl)
    }
  }

  const handleKeyDown = (e) => {
    if (hashtagSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSuggestionIndex(prev => 
            prev < hashtagSuggestions.length - 1 ? prev + 1 : 0
          )
          break
          
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : hashtagSuggestions.length - 1
          )
          break
          
        case 'Enter':
          e.preventDefault()
          const parts = url.split(' ')
          const lastPart = parts[parts.length - 1]
          
          if (lastPart.startsWith('#')) {
            // If we're typing a hashtag, select the current suggestion
            handleSuggestionClick(hashtagSuggestions[selectedSuggestionIndex])
          } else {
            // Otherwise submit the form
            handleSubmit(e)
          }
          break
          
        case 'Escape':
          e.preventDefault()
          setHashtagSuggestions([])
          setCursorPosition(null)
          break
          
        default:
          break
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%" position="relative">
      <VStack spacing={4} align="stretch">
        <FormControl>
          <InputGroup size="lg">
            <Input
              ref={urlInputRef}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                handleHashtagInput(e.target.value, e.target)
                // Scroll input into view when typing
                e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              }}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder={isMobile ? "Paste URL" : "Paste URL or press ⌘V anywhere"}
              _placeholder={{ color: 'gray.400' }}
              pr={isMobile ? "3.5rem" : "16rem"}
              enterKeyHint="go"
              sx={{
                // Ensure text scrolls properly on mobile
                scrollPaddingRight: '3.5rem',
                textOverflow: 'ellipsis'
              }}
            />
            <InputRightElement width="auto" pr={2}>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <HStack spacing={2}>
                  {!isLoading && !isMobile && (
                    <>
                      <Text fontSize="sm" color="gray.500">use</Text>
                      <Kbd fontSize="xs">#name</Kbd>
                      <Text fontSize="sm" color="gray.500">to add or create folder</Text>
                      <Text fontSize="sm" color="gray.500">•</Text>
                      <Text fontSize="sm" color="gray.500">press</Text>
                      <Kbd fontSize="xs">enter</Kbd>
                      <Text fontSize="sm" color="gray.500">to save</Text>
                    </>
                  )}
                  {!isLoading && isMobile && (
                    <IconButton
                      icon={<CheckIcon />}
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleSubmit()}
                      aria-label="Save bookmark"
                    />
                  )}
                </HStack>
              )}
            </InputRightElement>
          </InputGroup>
        </FormControl>

        {clipboardUrl && (
          <Button
            leftIcon={<LinkIcon />}
            size="sm"
            variant="ghost"
            width="100%"
            justifyContent="flex-start"
            color="gray.500"
            fontWeight="normal"
            onClick={handleClipboardSuggestion}
            _hover={{ bg: 'gray.50', color: 'gray.700' }}
          >
            Add from clipboard: {clipboardUrl.length > 40 ? clipboardUrl.substring(0, 40) + '...' : clipboardUrl}
          </Button>
        )}

        {hashtagSuggestions.length > 0 && cursorPosition && (
          <Box
            position="absolute"
            top={`${cursorPosition.top}px`}
            left={`${cursorPosition.left}px`}
            zIndex={1000}
            bg="white"
            boxShadow="sm"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          >
            <VStack align="stretch" spacing={0}>
              {hashtagSuggestions.map((suggestion, index) => (
                <Box
                  key={suggestion}
                  px={3}
                  py={2}
                  cursor="pointer"
                  bg={index === selectedSuggestionIndex ? 'gray.100' : 'transparent'}
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Badge 
                    size="md" 
                    variant="subtle" 
                    colorScheme={index === selectedSuggestionIndex ? "blue" : "gray"}
                    display="flex"
                    alignItems="center"
                    gap={1}
                    transition="all 0.2s"
                    transform={index === selectedSuggestionIndex ? 'scale(1.02)' : 'scale(1)'}
                  >
                    <Icon 
                      as={FaFolder} 
                      fontSize="xs"
                      color={index === selectedSuggestionIndex ? "blue.500" : "inherit"}
                    />
                    {suggestion}
                  </Badge>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {isExpanded && (
          <VStack spacing={3} align="stretch">
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              onFocus={(e) => {
                const len = e.target.value.length;
                e.target.setSelectionRange(len, len);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Title"
              size="lg"
              variant="unstyled"
              fontSize="lg"
              fontWeight="500"
              px={1}
              _placeholder={{ color: 'gray.400' }}
              _hover={{ bg: 'gray.50' }}
              _focus={{ 
                bg: 'gray.50',
                boxShadow: 'none'
              }}
              enterKeyHint="go"
            />
            
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              onFocus={(e) => {
                const len = e.target.value.length;
                e.target.setSelectionRange(len, len);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Add description (optional)"
              size="lg"
              variant="unstyled"
              fontSize="md"
              px={1}
              _placeholder={{ color: 'gray.400' }}
              _hover={{ bg: 'gray.50' }}
              _focus={{ 
                bg: 'gray.50',
                boxShadow: 'none'
              }}
              enterKeyHint="go"
            />
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default BookmarkForm