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
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { CheckIcon, LinkIcon } from '@chakra-ui/icons'

function BookmarkForm({ onSubmit }) {
  const [url, setUrl] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    image: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [clipboardUrl, setClipboardUrl] = useState(null)
  const urlInputRef = useRef(null)
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
      // Check clipboard when component mounts
      checkClipboard()
      
      // Check clipboard when app gains focus
      const handleFocus = () => {
        checkClipboard()
      }
      window.addEventListener('focus', handleFocus)
      
      // Check clipboard periodically (every 2 seconds)
      const intervalId = setInterval(checkClipboard, 2000)
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        clearInterval(intervalId)
      }
    }
  }, [isMobile, url])

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

  useEffect(() => {
    const handlePaste = async (e) => {
      const pastedText = e.clipboardData?.getData('text')
      if (pastedText?.startsWith('http')) {
        e.preventDefault()
        setUrl(pastedText)
        if (urlInputRef.current) {
          urlInputRef.current.focus()
        }
        await handleUrlSubmit(pastedText)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  const handleUrlSubmit = async (submittedUrl) => {
    if (!submittedUrl?.startsWith('http')) return
    
    setIsLoading(true)
    setFormData(prev => ({ ...prev, url: submittedUrl }))
    
    try {
      const metadata = await fetchMetadata(submittedUrl)
      setFormData(prev => ({
        ...prev,
        title: metadata.title || '',
        description: metadata.description || '',
        image: metadata.image || ''
      }))
      setIsExpanded(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isExpanded) {
      onSubmit(formData)
      setFormData({ url: '', title: '', description: '', image: '' })
      setUrl('')
      setIsExpanded(false)
    } else {
      handleUrlSubmit(url)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%">
      <VStack spacing={4} align="stretch">
        <FormControl>
          <InputGroup size="lg">
            <Input
              ref={urlInputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={isMobile ? "Paste URL" : "Paste URL or press ⌘+V anywhere"}
              _placeholder={{ color: 'gray.400' }}
              pr={isMobile ? "3.5rem" : "8rem"}
              enterKeyHint="go"
            />
            <InputRightElement width="auto" pr={2}>
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  {isMobile ? (
                    <IconButton
                      size="sm"
                      icon={<CheckIcon />}
                      variant="ghost"
                      color="gray.500"
                      aria-label="Save bookmark"
                      onClick={handleSubmit}
                      isDisabled={!url}
                      _hover={{ color: 'gray.700' }}
                    />
                  ) : (
                    <HStack spacing={1} opacity={0.5} fontSize="xs">
                      <Text>press</Text>
                      <Kbd fontSize="xs">enter</Kbd>
                      <Text>to save</Text>
                    </HStack>
                  )}
                </>
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