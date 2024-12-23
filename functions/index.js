import * as functions from 'firebase-functions'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

exports.fetchMetadata = functions.https.onCall(async (data, context) => {
  try {
    const { url } = data
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    // Get metadata
    const title = $('title').text() || 
                 $('meta[property="og:title"]').attr('content') || 
                 ''
    
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       ''
    
    const image = $('meta[property="og:image"]').attr('content') || 
                 $('link[rel="icon"]').attr('href') ||
                 $('link[rel="shortcut icon"]').attr('href') ||
                 ''

    return {
      title,
      description,
      image: image ? new URL(image, url).href : ''
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
    throw new functions.https.HttpsError('internal', 'Error fetching metadata')
  }
})