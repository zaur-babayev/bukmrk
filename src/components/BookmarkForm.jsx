import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Image,
  Skeleton,
  Heading,
  HStack,
} from '@chakra-ui/react'
import { useState } from 'react'

function BookmarkForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    image: ''
  })
  const [isLoading, setIsLoading] = useState(false)

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
      const metadata = await response.json()

      if (metadata.error) {
        throw new Error(metadata.error)
      }

      setFormData(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        image: metadata.image || prev.image
      }))
    } catch (error) {
      console.error('Error fetching metadata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlChange = async (e) => {
    const url = e.target.value
    setFormData(prev => ({ ...prev, url }))
    
    if (url && url.startsWith('http')) {
      await fetchMetadata(url)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ url: '', title: '', description: '', image: '' })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Box 
      as="form" 
      onSubmit={handleSubmit} 
      mb={8} 
      bg="white" 
      p={6} 
      borderRadius="lg" 
      shadow="sm"
      borderWidth="1px"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md" mb={2}>🗂️ BukMrk</Heading>
        <FormControl isRequired>
          <FormLabel>URL</FormLabel>
          <Input
            name="url"
            type="url"
            value={formData.url}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            bg="white"
          />
        </FormControl>

        <HStack spacing={4} align="start">
          <FormControl isRequired flex={1}>
            <FormLabel>Title</FormLabel>
            <Skeleton isLoaded={!isLoading}>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter bookmark title"
                bg="white"
              />
            </Skeleton>
          </FormControl>

          <FormControl flex={1}>
            <FormLabel>Description</FormLabel>
            <Skeleton isLoaded={!isLoading}>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter bookmark description"
                size="sm"
                bg="white"
                rows={1}
              />
            </Skeleton>
          </FormControl>
        </HStack>

        {formData.image && (
          <Image
            src={formData.image}
            alt="Site preview"
            maxH="60px"
            objectFit="contain"
          />
        )}

        <Button 
          type="submit" 
          colorScheme="blue"
          isLoading={isLoading}
          alignSelf="flex-end"
        >
          Add Bookmark
        </Button>
      </VStack>
    </Box>
  )
}

export default BookmarkForm 