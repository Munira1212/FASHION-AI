
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config/firebase';
import { decode } from 'base64-arraybuffer';
import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const DreamClosetScreen = ({ route }) => {
  const images = route.params?.images || [];
  const [saving, setSaving] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    const uploadImages = async () => {
      const user = { uid: 'testUser123' }; // Temporary fallback user
      setSaving(true);

      try {
        const urls = [];

        for (let i = 0; i < images.length; i++) {
          const currentImage = images[i];

          if (!currentImage.base64) {
            console.warn(`⛔ Skipping image ${i + 1}, no base64 data found.`);
            setErrors(prev => [...prev, `Image ${i + 1} is missing base64 data.`]);
            continue;
          }

          // Get the correct MIME type or default to 'image/jpeg'
          const mimeType = currentImage.mimeType || 'image/jpeg';
          
          const filename = `outfits/${user.uid}/${Date.now()}_${i}.jpg`;
          const storageRef = ref(storage, filename);
          
          // Set the correct content type in metadata
          const metadata = {
            contentType: mimeType
          };
          
          const binaryData = new Uint8Array(decode(currentImage.base64));
          
          try {
            await uploadBytes(storageRef, binaryData, metadata);
            const downloadURL = await getDownloadURL(storageRef);
            urls.push(downloadURL);

            // Skip Firestore for now - just log the success
            console.log(`✅ Image ${i + 1} uploaded successfully to ${downloadURL}`);
            
            // Still increment counter
            setSavedCount(prev => prev + 1);
          } catch (uploadError) {
            console.error(`❌ Error uploading image ${i + 1}:`, uploadError);
            setErrors(prev => [...prev, `Error uploading image ${i + 1}: ${uploadError.message}`]);
          }
        }

        setImageUrls(urls);
        console.log('✅ Upload process completed with', urls.length, 'successful uploads');
        
        if (urls.length > 0) {
          await analyzeStyle(urls);
        } else {
          console.warn('⚠️ No images were successfully uploaded for AI analysis');
        }
      } catch (error) {
        console.error('❌ Overall upload process error:', error);
        Alert.alert('Upload Error', error.message || 'Something went wrong during the upload process.');
        setErrors(prev => [...prev, error.message]);
      } finally {
        setSaving(false);
      }
    };

    const analyzeStyle = async (urls) => {
      if (urls.length === 0) return;
      
      console.log('🔍 Starting AI style analysis with', urls.length, 'images');
      
      try {
        // Only use the first 1-2 images for analysis to keep the request size reasonable
        const imagesToAnalyze = urls.slice(0, Math.min(2, urls.length));
        
        const messages = [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze these outfit photos and describe the person\'s fashion style in detail. Include keywords, brands, and outfit suggestions that would complement their style.'
              },
              ...imagesToAnalyze.map(url => ({
                type: 'image_url',
                image_url: { url }
              }))
            ]
          }
        ];

        console.log('📤 Sending request to OpenAI with', imagesToAnalyze.length, 'images');
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o',
          messages,
          max_tokens: 800,
          temperature: 0.7
        }, {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        const result = response.data.choices[0].message.content.trim();
        console.log('🧠 AI style analysis received, length:', result.length);
        setAiResult(result);
      } catch (error) {
        console.error('❌ AI request error:', error.response?.data || error.message || error);
        Alert.alert('AI Analysis Error', 'Could not generate style analysis. Please try again later.');
      }
    };

    if (images.length > 0) {
      uploadImages();
    } else {
      console.log('⚠️ No images to upload');
      setSaving(false);
    }
  }, [images]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Your Dream Closet ✨</Text>

      {saving ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4EFF" />
          <Text style={styles.loadingText}>
            Uploading your outfit photos and analyzing your style...
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>
            {images.length === 0 ? 'No images selected' :
              errors.length === 0
                ? `All ${savedCount} outfits uploaded successfully!`
                : `Uploaded ${savedCount}/${images.length} with ${errors.length} errors.`}
          </Text>
          
          {errors.length > 0 && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Some uploads failed:</Text>
              {errors.slice(0, 3).map((error, idx) => (
                <Text key={idx} style={styles.errorText}>• {error}</Text>
              ))}
              {errors.length > 3 && (
                <Text style={styles.errorText}>• ...and {errors.length - 3} more errors</Text>
              )}
            </View>
          )}
          
          {aiResult && (
            <View style={styles.aiBlock}>
              <Text style={styles.aiTitle}>AI Style Breakdown:</Text>
              <Text style={styles.aiContent}>{aiResult}</Text>
            </View>
          )}
        </>
      )}

      <View style={styles.grid}>
        {images.map((img, index) => (
          <Image 
            key={index} 
            source={{ uri: img.uri }} 
            style={styles.image} 
            resizeMode="cover"
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: '#FDFCF9', 
    minHeight: '100%' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#4B3B77', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#555', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 30
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666'
  },
  image: { 
    width: '48%', 
    aspectRatio: 3 / 4, 
    borderRadius: 10, 
    marginBottom: 12,
    backgroundColor: '#f0f0f0'
  },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    marginTop: 10
  },
  aiBlock: { 
    marginVertical: 20, 
    padding: 16, 
    backgroundColor: '#EFEAF6', 
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6B4EFF'
  },
  aiTitle: { 
    fontWeight: 'bold', 
    marginBottom: 8, 
    color: '#4B3B77',
    fontSize: 16
  },
  aiContent: {
    lineHeight: 20
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#FF4D4F'
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#CF1322',
    marginBottom: 6
  },
  errorText: {
    color: '#5C0011',
    fontSize: 13,
    marginBottom: 4
  }
});

export default DreamClosetScreen;