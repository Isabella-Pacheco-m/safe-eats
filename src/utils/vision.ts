const API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export async function extractTextFromImage(imageFile: File): Promise<string> {
  try {
    // Convert image to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    // Prepare request body
    const requestBody = {
      requests: [{
        image: {
          content: base64Image
        },
        features: [{
          type: 'TEXT_DETECTION'
        }]
      }]
    };

    // Make API request
    const response = await fetch(`${VISION_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    const data = await response.json();
    return data.responses[0]?.textAnnotations?.[0]?.description || '';
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}