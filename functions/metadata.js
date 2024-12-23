export async function onRequestPost(context) {
  try {
    const { url } = await context.request.json()
    const response = await fetch(url)
    const html = await response.text()
    
    // Helper function to decode HTML entities
    const decodeHTML = (text) => {
      return text
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&hellip;/g, '...')
        .replace(/&#8211;/g, '-')
        .replace(/\s+/g, ' ')
        .trim()
    }
    
    // Basic metadata extraction using regex
    const titleMatch = html.match(/<title>(.*?)<\/title>/) || 
                      html.match(/<meta property="og:title" content="(.*?)"/)
    const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/) || 
                            html.match(/<meta property="og:description" content="(.*?)"/)
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/) || 
                      html.match(/<link rel="icon" href="(.*?)"/)

    const title = titleMatch ? decodeHTML(titleMatch[1]) : ''
    const description = descriptionMatch ? decodeHTML(descriptionMatch[1]) : ''
    const image = imageMatch ? new URL(imageMatch[1], url).href : ''

    return new Response(JSON.stringify({
      title,
      description,
      image
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
} 