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
    <Box as="form" onSubmit={handleSubmit} mb={8}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>URL</FormLabel>
          <Input
            name="url"
            type="url"
            value={formData.url}
            onChange={handleUrlChange}
            placeholder="https://example.com"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Skeleton isLoaded={!isLoading}>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter bookmark title"
            />
          </Skeleton>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Skeleton isLoaded={!isLoading}>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter bookmark description"
            />
          </Skeleton>
        </FormControl>

        {formData.image && (
          <Image
            src={formData.image}
            alt="Site preview"
            maxH="100px"
            objectFit="contain"
          />
        )}

        <Button 
          type="submit" 
          colorScheme="blue"
          isLoading={isLoading}
        >
          Add Bookmark
        </Button>
      </VStack>
    </Box>
  )
}

export default BookmarkForm 