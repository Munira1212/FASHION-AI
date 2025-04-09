/*import React, { useState } from 'react';
import { View, Text, TextInput, Image, ActivityIndicator, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const FashionRecommendationScreen = () => {
  const [userInput, setUserInput] = useState('');
  const [budget, setBudget] = useState('');
  const [colors, setColors] = useState('');
  const [loading, setLoading] = useState(false);
  const [outfitRecommendation, setOutfitRecommendation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [recommendationType, setRecommendationType] = useState('similar'); // 'similar' or 'custom'
  const [shoppingLinks, setShoppingLinks] = useState([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      // Reset results when new image is selected
      setOutfitRecommendation('');
      setShoppingLinks([]);
    }
  };

  const generatePrompt = () => {
    if (recommendationType === 'similar') {
      return `Analyze this outfit image and provide:
1. A brief description of what's in the image
2. List 5 specific store recommendations where someone could buy similar items (include both online and physical stores)
3. For each store, suggest 1-2 specific items that would match the style in the image
4. Estimated price range for each item
Budget: $${budget || "100"}, Preferred colors: ${colors || "same as in image"}
Format as JSON with keys: description, recommendations (array with store, items, priceRange)`;
    } else {
      return `Based on this outfit image, create a fresh styling recommendation with these requirements:
1. Create a new outfit inspired by this style but with ${userInput || "updated trends"}
2. List 5 specific stores where someone could buy each piece
3. For each store, suggest 1-2 specific items that would work for the outfit
4. Estimated price range for each item
Budget: $${budget || "100"}, Preferred colors: ${colors || "versatile mix"}
Format as JSON with keys: description, newOutfit, recommendations (array with store, items, priceRange)`;
    }
  };

  const handleGetRecommendations = async () => {
    if (!selectedImage) {
      Alert.alert('Missing Image', 'Please upload an outfit image first.');
      return;
    }

    setLoading(true);
    const base64Image = selectedImage.base64;

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: generatePrompt() },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.7,
        response_format: { type: "json_object" }
      }, {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.choices) {
        const content = response.data.choices[0].message.content.trim();
        try {
          const parsedContent = JSON.parse(content);
          setOutfitRecommendation(parsedContent.description || parsedContent.newOutfit || '');
          setShoppingLinks(parsedContent.recommendations || []);
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          setOutfitRecommendation(content);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      Alert.alert('Error', 'Failed to fetch outfit recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Style Finder AI</Text>
      <Text style={styles.subtitle}>Find where to buy the styles you love 👗🛍️</Text>

      <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
        <Text style={styles.imageUploadText}>{selectedImage ? 'Change Image' : 'Upload Outfit Image'}</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Image source={{ uri: selectedImage.uri }} style={styles.image} />
      )}

      <View style={styles.segmentedControl}>
        <TouchableOpacity 
          style={[
            styles.segmentButton, 
            recommendationType === 'similar' && styles.segmentButtonActive
          ]}
          onPress={() => setRecommendationType('similar')}
        >
          <Text style={[
            styles.segmentButtonText,
            recommendationType === 'similar' && styles.segmentButtonTextActive
          ]}>Find Similar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[ 
            styles.segmentButton, 
            recommendationType === 'custom' && styles.segmentButtonActive
          ]}
          onPress={() => setRecommendationType('custom')}
        >
          <Text style={[
            styles.segmentButtonText,
            recommendationType === 'custom' && styles.segmentButtonTextActive
          ]}>Custom Style</Text>
        </TouchableOpacity>
      </View>

      {recommendationType === 'custom' && (
        <TextInput
          style={styles.input}
          placeholder="What style are you going for? (e.g., casual, formal)"
          value={userInput}
          onChangeText={setUserInput}
          placeholderTextColor="#888"
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Your budget (e.g., 100)"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        placeholderTextColor="#888"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Preferred colors (e.g., black, white)"
        value={colors}
        onChangeText={setColors}
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGetRecommendations}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Finding styles...' : recommendationType === 'similar' ? 'Find Where to Buy' : 'Get Style Ideas'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#A855F7" style={{ marginTop: 20 }} />}

      {outfitRecommendation && !loading && (
        <View style={styles.recommendationBox}>
          <Text style={styles.recommendationTitle}>
            {recommendationType === 'similar' ? 'Where To Get This Look 👀' : 'Your Custom Style 💫'}
          </Text>
          <Text style={styles.recommendationText}>{outfitRecommendation}</Text>
          
          {shoppingLinks.length > 0 && (
            <View style={styles.shoppingLinksContainer}>
              <Text style={styles.shoppingLinksTitle}>Where to Shop:</Text>
              {shoppingLinks.map((link, index) => (
                <View key={index} style={styles.shopItem}>
                  <Text style={styles.shopName}>{link.store}</Text>
                  <Text style={styles.shopItems}>{link.items}</Text>
                  <Text style={styles.shopPrice}>Price Range: {link.priceRange}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F5FF' },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#4B0082' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#6B21A8' },
  input: {
    height: 48,
    borderColor: '#D8B4FE',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    marginBottom: 16,
    color: '#000',
  },
  imageUpload: {
    backgroundColor: '#E9D5FF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  imageUploadText: {
    fontWeight: 'bold',
    color: '#6B21A8',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
  },
  segmentButtonActive: {
    backgroundColor: '#A855F7',
  },
  segmentButtonText: {
    fontWeight: '500',
    color: '#6B21A8',
  },
  segmentButtonTextActive: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#A855F7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6B21A8',
  },
  recommendationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  shoppingLinksContainer: {
    marginTop: 8,
  },
  shoppingLinksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6B21A8',
  },
  shopItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#A855F7',
  },
  shopName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#4B0082',
    marginBottom: 4,
  },
  shopItems: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  shopPrice: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  }
});

export default FashionRecommendationScreen;*/

// Name suggestion: DreamClosetAI.js


/*import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image,
  TextInput, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const DreamClosetScreen = () => {
  const [images, setImages] = useState([]);
  const [style, setStyle] = useState('Clean Girl');
  const [budget, setBudget] = useState('Under $300');
  const [season, setSeason] = useState('Spring/Summer');
  const [notes, setNotes] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const generatePrompt = () => {
    return `You are a stylist. Based on ${images.length} aesthetic outfit images, create a capsule wardrobe with 15 items: tops, bottoms, outerwear, shoes, accessories. Include 2 store suggestions and price range per item. Style: ${style}. Budget: ${budget}. Season: ${season}. Extra notes: ${notes}. Format JSON: styleAnalysis, capsuleWardrobe (name, category, priceRange, stores), outfitCombinations.`;
  };

  const generateWardrobe = async () => {
    if (images.length < 2) {
      Alert.alert('Add more inspiration', 'Upload at least 2 outfit images.');
      return;
    }

    setLoading(true);

    try {
      const content = [
        { type: 'text', text: generatePrompt() },
        ...images.map(img => ({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${img.base64}` },
        }))
      ];

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [{ role: 'user', content }],
        max_tokens: 1200,
        temperature: 0.7,
      }, {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const parsed = JSON.parse(response.data.choices[0].message.content.trim());
      setResults(parsed);
    } catch (e) {
      console.error(e);
      Alert.alert('Oops', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Dream Closet</Text>
      <Text style={styles.subheader}>Upload inspo. Get your curated lookbook.</Text>

      <TouchableOpacity onPress={uploadImage} style={styles.uploadCard}>
        <Text style={styles.uploadText}>{images.length > 0 ? 'Add More Inspiration' : 'Upload Inspiration Image'}</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img.uri }}
            style={styles.imageThumb}
          />
        ))}
      </ScrollView>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Budget</Text>
        <Text style={styles.filterValue}>{budget}</Text>

        <Text style={styles.filterLabel}>Style</Text>
        <Text style={styles.filterValue}>{style}</Text>

        <Text style={styles.filterLabel}>Season</Text>
        <Text style={styles.filterValue}>{season}</Text>
      </View>

      <TextInput
        placeholder="Extra notes for your AI stylist..."
        placeholderTextColor="#AAA"
        multiline
        style={styles.notesBox}
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity
        style={[styles.generateButton, loading && styles.disabled]}
        onPress={generateWardrobe}
        disabled={loading}
      >
        <Text style={styles.generateButtonText}>{loading ? 'Styling...' : 'Generate Wardrobe'}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#BFA2DB" style={{ marginTop: 20 }} />}

      {results && (
        <View style={styles.resultContainer}>
          <Text style={styles.sectionTitle}>Vibe Check</Text>
          <Text style={styles.bodyText}>{results.styleAnalysis}</Text>

          <Text style={styles.sectionTitle}>Capsule Wardrobe</Text>
          {results.capsuleWardrobe?.map((item, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.cardTitle}>{item.name} — {item.category}</Text>
              <Text style={styles.bodyText}>Stores: {item.stores.join(', ')}</Text>
              <Text style={styles.bodyText}>Price: {item.priceRange}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Outfit Combos</Text>
          {results.outfitCombinations?.map((combo, i) => (
            <Text key={i} style={styles.bodyText}>• {combo}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#FDFCF9',
  },
  header: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheader: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7A7A7A',
    marginBottom: 20,
  },
  uploadCard: {
    backgroundColor: '#EFEAF6',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    color: '#6B4EFF',
    fontWeight: '500',
  },
  imageRow: {
    marginBottom: 16,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  filterLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 10,
  },
  filterValue: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  notesBox: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#D6C9F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: '#E2E8F0',
  },
  generateButtonText: {
    color: '#4B3B77',
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#4B3B77',
  },
  bodyText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 6,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#D6C9F0',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
});

export default DreamClosetScreen;*/

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const FashionRecommendationScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const cleanedImages = result.assets.map((asset) => ({
        uri: asset.uri,
        base64: asset.base64,
      }));
      setImages(prev => [...prev, ...cleanedImages]);
    }
  };

  const handleGenerate = () => {
    if (images.length < 1) {
      Alert.alert('Add an outfit photo to get started.');
      return;
    }
    navigation.navigate('DreamCloset', { images });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topbar}>
        <Ionicons name="shirt-outline" size={20} color="#4B3B77" style={{ marginRight: 8 }} />
        <Text style={styles.topbarText}>Style Builder</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.title}>Welcome to Your Dream Wardrobe ✨</Text>
          <Text style={styles.subtitle}>Upload outfit inspo and let AI help you curate the perfect lookbook.</Text>
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
          <Text style={styles.uploadButtonText}>{images.length > 0 ? 'Add More Photos' : 'Upload Photo'}</Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.uri }}
                style={styles.imageThumb}
              />
            ))}
          </ScrollView>
        )}

        <TouchableOpacity style={styles.buildButton} onPress={handleGenerate}>
          <Text style={styles.buildButtonText}>Build Wardrobe</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.lowbar}>
        <Text style={styles.lowbarText}>Powered by AI Fashion • v1</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FDFCF9',
  },
  container: {
    padding: 20,
    paddingBottom: 80,
  },
  topbar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#EFEAF6',
    borderBottomWidth: 1,
    borderBottomColor: '#E0D1FB',
  },
  topbarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B3B77',
  },
  welcomeContainer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  uploadButton: {
    backgroundColor: '#EF5DA8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingLeft: 4,
  },
  imageThumb: {
    width: 90,
    height: 110,
    borderRadius: 10,
    marginRight: 16,
  },
  buildButton: {
    backgroundColor: '#6B4EFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buildButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lowbar: {
    height: 50,
    backgroundColor: '#EFEAF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0D1FB',
  },
  lowbarText: {
    fontSize: 12,
    color: '#999',
  },
});

export default FashionRecommendationScreen;
