'use server';

/**
 * Shuffles array in-place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}


/**
 * Generates mock listing data locally.
 * @param {{ city: string, listingType: 'homestays' | 'guides' }} input
 * @returns {Array<Object>} An array of mock listings.
 */
function generateMockListings({ city, listingType }) {
  const listings = [];
  const mockHostIds = ['mock-host-1', 'mock-host-2', 'mock-host-3'];
  
  if (listingType === 'homestays') {
    const count = 32;

    let homestayNames = [
      "Serene Sanctuary", "Mountain Whisper Cottage", "Green Valley Abode", "Coastal Charm Villa",
      "Sunrise Meadows", "Riverbend Retreat", "The Rustic Barn", "Cityscape Suite",
      "Lakeside Lodge", "Bloomfield Homestay", "Heritage Haven", "The Minimalist Loft",
      "Bohemian Bungalow", "Pine Forest Getaway", "Tranquil Terrace", "Orchard Grove",
      "The Azure House", "Golden Sands Stay", "Eagle's Peak", "Hilltop Hideout",
      "The Artist's Nook", "Country Comfort Cottage", "The Urban Escape", "Seaside Serenity",
      "The Writer's Corner", "Starlight Cabin", "The Garden Hideaway", "Palm Grove Inn",
      "The Vintage Residence", "Coral Cove Homestay", "The Glass Pavilion", "The Royal Manor"
    ];

    let homestayImageHints = [
      'modern room', 'cozy cottage', 'guest suite', 'nature cabin', 'luxury villa', 'beach house',
      'mountain lodge', 'rustic farmhouse', 'urban apartment', 'riverside retreat', 'garden view', 'poolside cabana',
      'historic home', 'minimalist studio', 'bohemian loft', 'penthouse suite', 'lakefront bungalow', 'forest hideaway',
      'desert oasis', 'tropical paradise', 'eco friendly home', 'ski chalet', 'country manor', 'island hut',
      'treehouse escape', 'yurt experience', 'glass house', 'A-frame cabin', 'stone cottage', 'log cabin', 'houseboat stay', 'art deco flat'
    ];
    
    let landmarkNames = [
        "Central Park", "City Museum", "Riverfront Promenade", "Old Town Square",
        "Grand Cathedral", "Botanical Gardens", "National Art Gallery", "Historic Clock Tower",
        "Main Street Market", "Victory Monument", "The Grand Theatre", "Parliament House",
        "The Royal Palace", "State University Campus", "The Tech Park", "Freedom Bridge",
        "St. John's Church", "The Observatory", "Sunset Point", "The Art Deco District",
        "Cultural Heritage Center", "The Great Library", "War Memorial", "The Shopping Arcade",
        "City Zoo", "The Rose Garden", "Hilltop Viewpoint", "The Ancient Ruins",
        "Lakeside Park", "The Spice Market", "The Lighthouse", "The Old Fort"
    ];

    // Shuffle the arrays to randomize the data
    shuffle(homestayNames);
    shuffle(homestayImageHints);
    shuffle(landmarkNames);

    for (let i = 0; i < count; i++) {
      listings.push({
        id: `${city.replace(/\s/g, '-')}-homestay-${i + 1}-${Math.random()}`,
        name: homestayNames[i] || `Sample Homestay ${i + 1} in ${city}`,
        location: `Near ${landmarkNames[i]}`,
        price: 1500 + Math.floor(Math.random() * 8500),
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        description: `Experience the local culture in this beautiful ${homestayImageHints[i].split(' ').pop()} located near ${landmarkNames[i]}.`,
        imageHint: homestayImageHints[i] || 'homestay interior',
        hostId: mockHostIds[i % mockHostIds.length],
      });
    }
  } else if (listingType === 'guides') {
    const count = 32;
    
    let guideNames = [
        'Aarav Sharma', 'Diya Patel', 'Rohan Das', 'Isha Singh', 'Vikram Rathore', 'Anika Gupta',
        'Aditya Verma', 'Mira Joshi', 'Arjun Reddy', 'Saanvi Desai', 'Kabir Kumar', 'Zara Khan',
        'Ishaan Malhotra', 'Priya Rao', 'Dev Mehra', 'Sia Chatterjee', 'Neel Menon', 'Myra Reddy',
        'Samar Ali', 'Avani Iyer', 'Vivaan Pillai', 'Tara Nair', 'Yash Sinha', 'Kiara Khanna',
        'Reyansh Thakur', 'Ananya Bajaj', 'Ayaan Krish', 'Riya Dubey', 'Zain Abdullah', 'Navya Bhat',
        'Arin Saxena', 'Diya Shankar'
    ];
    shuffle(guideNames);

    let guideImageHints = [
        'male guide portrait', 'female guide portrait', 'person portrait', 'friendly guide',
        'professional guide', 'tour guide illustration', 'adventure guide', 'cultural guide avatar',
        'historical guide', 'smiling guide', 'nature guide', 'travel expert',
        'male character', 'female character', 'smiling person', 'young professional',
        'experienced guide', 'local expert', 'friendly face', 'travel companion',
        'knowledgeable guide', 'happy guide', 'smiling expert', 'local host',
        'mountain guide', 'city expert', 'heritage guide', 'culture expert',
        'cheerful guide', 'outdoor expert', 'tour expert', 'travel guide'
    ];
    shuffle(guideImageHints);

    const specialties = ['Spiritual Tours', 'Boat Tours', 'Culture & Heritage', 'Food Walks', 'Photography Tours', 'Adventure Trips'];
    const languages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada'];

    for (let i = 0; i < count; i++) {
        const knownLanguages = shuffle([...languages]).slice(0, Math.floor(Math.random() * 2) + 2);
        listings.push({
            id: `${city.replace(/\s/g, '-')}-guide-${i + 1}-${Math.random()}`,
            name: guideNames[i] || `Sample Guide ${i + 1}`,
            experience: Math.floor(Math.random() * 10) + 3,
            languages: knownLanguages,
            rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
            rate: 1500 + Math.floor(Math.random() * 1501),
            specialty: specialties[Math.floor(Math.random() * specialties.length)],
            imageHint: guideImageHints[i] || 'person portrait',
        });
    }
  }

  return listings;
}

export async function generateListingsAction(input) {
    try {
        const listings = generateMockListings(input);
        await new Promise(resolve => setTimeout(resolve, 500));
        return listings;
    } catch (error) {
        console.error('Error in generateListingsAction:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate listings: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating listings.');
    }
}
