import {
  Box,
  Heading,
  Link,
  Text,
  VStack,
  HStack,
  Badge,
  IconButton,
  Image,
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'

function BookmarkList({ bookmarks, onDelete }) {
  return (
    <VStack spacing={4} align="stretch">
      <Heading size="lg" mb={4} color="blue.600">
        Your Bukmrks
      </Heading>
      {bookmarks.map((bookmark) => (
        <Box
          key={bookmark.id}
          p={5}
          shadow="md"
          borderWidth="1px"
          borderRadius="lg"
          bg="white"
          _hover={{ shadow: 'lg', transition: 'all 0.2s' }}
        >
          <HStack justify="space-between" mb={2}>
            <Heading size="md">
              <Link href={bookmark.url} isExternal color="blue.500">
                {bookmark.title}
              </Link>
            </Heading>
            <HStack>
              <Badge colorScheme="blue">
                {new Date(bookmark.createdAt).toLocaleDateString()}
              </Badge>
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                variant="ghost"
                onClick={() => onDelete(bookmark.id)}
                aria-label="Delete bookmark"
              />
            </HStack>
          </HStack>
          <Text color="gray.600">{bookmark.description}</Text>
          {bookmark.image && (
            <Image
              src={bookmark.image}
              alt={bookmark.title}
              maxH="100px"
              objectFit="contain"
              mb={2}
            />
          )}
        </Box>
      ))}
    </VStack>
  )
}

export default BookmarkList 