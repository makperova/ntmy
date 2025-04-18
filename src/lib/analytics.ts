/**
 * Function to record a card view in analytics
 * @param cardId The ID of the card being viewed
 */
export async function recordCardView(cardId: string) {
  try {
    // Check if cardId is defined
    if (!cardId) {
      console.error('Card ID is missing, cannot record view');
      return;
    }

    console.log('Recording view for card:', cardId);
    
    // Use fetch to call the analytics API endpoint
    const response = await fetch('/api/analytics/record-card-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to record card view: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully recorded card view:', data);
    return data;
  } catch (error) {
    console.error('Error recording card view:', error);
    // Don't throw the error to avoid breaking the UI
  }
} 