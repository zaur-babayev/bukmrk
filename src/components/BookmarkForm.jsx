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
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'

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
  const urlInputRef = useRef(null)

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
              placeholder="Paste URL or press ⌘+V anywhere"
              _placeholder={{ color: 'gray.400' }}
              pr="4.5rem"
            />
            {isLoading && (
              <InputRightElement width="4.5rem">
                <Spinner size="sm" />
              </InputRightElement>
            )}
          </InputGroup>
        </FormControl>

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
            />
          </VStack>
        )}
      </VStack>
    </Box>
  )
}

export default BookmarkForm 