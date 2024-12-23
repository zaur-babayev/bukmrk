export async function onRequestPost(context) {
  try {
    const { url } = await context.request.json()
    
    // Add user-agent and accept headers to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkManager/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

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
    
    // Improved metadata extraction
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/) || 
                      html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/) ||
                      html.match(/<meta[^>]*name="twitter:title"[^>]*content="([^"]*)"/)
                      
    const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/) || 
                            html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/) ||
                            html.match(/<meta[^>]*name="twitter:description"[^>]*content="([^"]*)"/)
                            
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/) || 
                      html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]*)"/) ||
                      html.match(/<link[^>]*rel="icon"[^>]*href="([^"]*)"/)

    const title = titleMatch ? decodeHTML(titleMatch[1]) : ''
    const description = descriptionMatch ? decodeHTML(descriptionMatch[1]) : ''
    const image = imageMatch ? new URL(imageMatch[1], url).href : ''

    console.log('Extracted metadata:', { title, description, image }) // Debug log

    return new Response(JSON.stringify({ title, description, image }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
  } catch (error) {
    console.error('Metadata extraction error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      title: new URL(url).hostname,
      description: '',
      image: ''
    }), {
      status: 200, // Still return 200 with fallback data
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    })
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}