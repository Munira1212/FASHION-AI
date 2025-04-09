import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const DreamWardrobeScreen = ({ navigation }) => {
  const [wardrobeImages, setWardrobeImages] = useState([]);
  const [wardrobeStyle, setWardrobeStyle] = useState('');
  const [wardrobeBudget, setWardrobeBudget] = useState('');
  const [seasonality, setSeasonality] = useState('');
  const [generatedWardrobe, setGeneratedWardrobe] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setWardrobeImages([...wardrobeImages, ...result.assets]);
    }
  };

  const clearWardrobe = () => {
    setWardrobeImages([]);
    setGeneratedWardrobe(null);
  };

  const generatePrompt = () => {
    return `Based on ${wardrobeImages.length} images, create a capsule wardrobe with 15 items. Include tops, bottoms, shoes, accessories. Add 2 store options and price range per item. Preferences: ${wardrobeStyle}, $${wardrobeBudget}, ${seasonality}. Format JSON: styleAnalysis, capsuleWardrobe, outfitCombinations.`;
  };

  const generateWardrobe = async () => {
    if (wardrobeImages.length < 2) {
      Alert.alert('Add more images', 'You need at least 2 images to create a wardrobe.');
      return;
    }

    setLoading(true);

    try {
      const content = [
        { type: 'text', text: generatePrompt() },
        ...wardrobeImages.map(img => ({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${img.base64}` },
        }))
      ];

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }, {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const contentText = response.data.choices[0].message.content.trim();
      const parsed = JSON.parse(contentText);
      setGeneratedWardrobe(parsed);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong while generating your wardrobe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dream Wardrobe ✨</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navButton}>
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImages} style={styles.navButton}>
          <Text style={styles.navButtonText}>Add Images</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearWardrobe} style={styles.navButton}>
          <Text style={styles.navButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Style (e.g., streetwear)"
        style={styles.input}
        value={wardrobeStyle}
        onChangeText={setWardrobeStyle}
      />
      <TextInput
        placeholder="Total Budget"
        style={styles.input}
        value={wardrobeBudget}
        onChangeText={setWardrobeBudget}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Season (e.g., Summer)"
        style={styles.input}
        value={seasonality}
        onChangeText={setSeasonality}
      />

      <TouchableOpacity onPress={generateWardrobe} style={styles.generateButton}>
        <Text style={styles.generateButtonText}>
          {loading ? 'Creating wardrobe...' : 'Create Wardrobe'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#A855F7" style={{ marginTop: 20 }} />}

      {generatedWardrobe && (
        <View style={styles.results}>
          <Text style={styles.resultTitle}>Style Summary</Text>
          <Text>{generatedWardrobe.styleAnalysis}</Text>

          <Text style={styles.resultTitle}>Capsule Items</Text>
          {generatedWardrobe.capsuleWardrobe?.map((item, i) => (
            <View key={i} style={styles.itemCard}>
              <Text style={styles.itemTitle}>{item.name} - {item.category}</Text>
              <Text>Stores: {item.stores.join(', ')}</Text>
              <Text>Price: {item.priceRange}</Text>
            </View>
          ))}

          <Text style={styles.resultTitle}>Outfit Combos</Text>
          {generatedWardrobe.outfitCombinations?.map((combo, i) => (
            <Text key={i} style={styles.combo}>{combo}</Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F9F5FF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#6B21A8', textAlign: 'center', marginBottom: 16 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  navButton: { backgroundColor: '#E9D5FF', padding: 10, borderRadius: 8 },
  navButtonText: { color: '#6B21A8', fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#D8B4FE', borderRadius: 10, padding: 10, marginBottom: 12, backgroundColor: 'white' },
  generateButton: { backgroundColor: '#A855F7', padding: 14, borderRadius: 10, alignItems: 'center' },
  generateButtonText: { color: 'white', fontWeight: 'bold' },
  results: { marginTop: 20 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#4B0082' },
  itemCard: { padding: 10, backgroundColor: 'white', marginBottom: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#A855F7' },
  itemTitle: { fontWeight: 'bold', marginBottom: 4 },
  combo: { marginBottom: 6 },
});

export default DreamWardrobeScreen;
