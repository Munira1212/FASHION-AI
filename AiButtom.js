import React, { useState } from "react";
import {
 View,
 Text,
 TouchableOpacity,
 ActivityIndicator,
 StyleSheet,
 ScrollView,
 Image,
 Linking,
} from "react-native";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";


const OPENAI_API_KEY = Constants.manifest.extra.OPENAI_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";


export default function App() {
 const [loading, setLoading] = useState(false);
 const [messages, setMessages] = useState([]);
 const [showForm, setShowForm] = useState(true);


 const pickImage = async () => {
   const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
   if (!permissionResult.granted) {
     alert("We need permission to access your camera roll.");
     return;
   }


   const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsEditing: true,
     base64: true,
     quality: 1,
   });


   if (!result.canceled && result.assets && result.assets.length > 0) {
     const imageUri = result.assets[0].uri;
     const base64Image = result.assets[0].base64;
     analyzeImageAndSearch(imageUri, base64Image);
   }
 };


 const getRetailerLinks = (query) => {
   const encoded = encodeURIComponent(query);
   return [
     {
       name: "ASOS",
       url: `https://www.asos.com/search/?q=${encoded}`,
     },
     {
       name: "H&M",
       url: `https://www2.hm.com/en_gb/search-results.html?q=${encoded}`,
     },
     {
       name: "Zara",
       url: `https://www.zara.com/dk/en/search?searchTerm=${encoded}`,
     },
   ];
 };


 const fetchLinkPreview = async (url) => {
   try {
     const res = await fetch(
       `https://opengraph.io/api/1.1/site/${encodeURIComponent(url)}?app_id=63abe45f-34c4-427a-a74a-c1697f12a571`
     );
     const data = await res.json();
     const imageUrl = data.hybridGraph?.image || null;
     console.log("OpenGraph preview for", url, "->", imageUrl);
     return imageUrl;
   } catch (error) {
     console.warn("OpenGraph fetch failed:", error);
     return null;
   }
 };


 const analyzeImageAndSearch = async (imageUri, base64Image) => {
   setLoading(true);
   setMessages([{ type: "user", content: "Analyzing outfit...", image: imageUri }]);


   try {
     const response = await fetch(API_URL, {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${OPENAI_API_KEY}`,
       },
       body: JSON.stringify({
         model: "gpt-4-turbo",
         messages: [
           {
             role: "system",
             content: `You are a  profesional fashion stylist. When analyzing an outfit, return detailed and specific clothing item descriptions (5–10 words) ideal for online search. Include style, color, pattern, and fit.`


           },
           {
             role: "user",
             content: [
               { type: "text", text: "List each clothing item in this outfit, 1 per line." },
               {
                 type: "image_url",
                 image_url: {
                   url: `data:image/jpeg;base64,${base64Image}`,
                 },
               },
             ],
           },
         ],
         max_tokens: 200,
       }),
     });


     const data = await response.json();


     if (response.ok) {
       const outfitItems = data.choices[0].message.content
         .split("\n")
         .map((item) => item.replace(/^[-•*]\s*/, "").trim())
         .filter(Boolean);


       const allLinks = [];


       for (const item of outfitItems) {
         const itemLinks = getRetailerLinks(item);


         for (const link of itemLinks) {
           const previewImage = await fetchLinkPreview(link.url);
           const fallbackPreview = `https://source.unsplash.com/300x400/?fashion,${encodeURIComponent(item)}`;
           const finalPreview = previewImage || fallbackPreview;


           console.log("Using preview for", item, ":", finalPreview);


           allLinks.push({
             type: "product",
             description: item,
             retailer: link.name,
             link: link.url,
             preview: finalPreview,
           });
         }
       }


       setMessages((prev) => [...prev, ...allLinks]);
     } else {
       throw new Error(data.error?.message || "Image analysis failed.");
     }
   } catch (error) {
     console.error("Image analysis error:", error);
     setMessages([{ type: "error", content: "Failed to analyze outfit. Try again." }]);
   } finally {
     setLoading(false);
     setShowForm(false);
   }
 };


 return (
   <View style={styles.container}>
     <Text style={styles.header}>Visual Fashion Matcher</Text>


     <ScrollView contentContainerStyle={styles.resultsContainer}>
       {messages.map((message, index) => {
         if (message.type === "user") {
           return (
             <View key={index} style={styles.imageCard}>
               <Image source={{ uri: message.image }} style={styles.cardImage} />
               <Text style={styles.processingText}>{message.content}</Text>
             </View>
           );
         } else if (message.type === "product") {
           return (
             <View key={index} style={styles.card}>
               <Image source={{ uri: message.preview }} style={styles.previewImage} />
               <Text style={styles.retailerText}>{message.retailer}</Text>
               <Text style={styles.cardText}>{message.description}</Text>
               <TouchableOpacity
                 style={styles.cardButton}
                 onPress={() => Linking.openURL(message.link)}
               >
                 <Text style={styles.cardButtonText}>View on {message.retailer}</Text>
               </TouchableOpacity>
             </View>
           );
         } else {
           return (
             <View key={index} style={styles.errorCard}>
               <Text style={styles.errorText}>{message.content}</Text>
             </View>
           );
         }
       })}


       {loading && <ActivityIndicator size="large" color="#007BFF" />}
     </ScrollView>


     <TouchableOpacity
       style={styles.uploadButton}
       onPress={pickImage}
       disabled={loading}
     >
       <Text style={styles.uploadButtonText}>Upload New Outfit</Text>
     </TouchableOpacity>
   </View>
 );
}


const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: "#ffffff",
   paddingTop: 60,
   paddingHorizontal: 20,
 },
 header: {
   fontSize: 24,
   fontWeight: "700",
   color: "#1a1a1a",
   marginBottom: 20,
   textAlign: "center",
 },
 resultsContainer: {
   paddingBottom: 100,
 },
 imageCard: {
   marginBottom: 20,
   alignItems: "center",
 },
 cardImage: {
   width: "100%",
   height: 220,
   borderRadius: 12,
   resizeMode: "cover",
   marginBottom: 10,
 },
 processingText: {
   fontSize: 16,
   color: "#888",
   textAlign: "center",
 },
 card: {
   backgroundColor: "#f9f9f9",
   borderRadius: 12,
   padding: 16,
   marginBottom: 16,
   elevation: 2,
 },
 previewImage: {
   width: "100%",
   height: 200,
   borderRadius: 8,
   marginBottom: 12,
 },
 retailerText: {
   fontSize: 14,
   fontWeight: "600",
   color: "#888",
   marginBottom: 4,
 },
 cardText: {
   fontSize: 16,
   fontWeight: "500",
   color: "#333",
   marginBottom: 10,
 },
 cardButton: {
   backgroundColor: "#007BFF",
   paddingVertical: 10,
   borderRadius: 8,
   alignItems: "center",
 },
 cardButtonText: {
   color: "#fff",
   fontWeight: "600",
   fontSize: 15,
 },
 uploadButton: {
   position: "absolute",
   bottom: 20,
   left: 20,
   right: 20,
   backgroundColor: "#28a745",
   paddingVertical: 16,
   borderRadius: 10,
   alignItems: "center",
 },
 uploadButtonText: {
   color: "#fff",
   fontSize: 17,
   fontWeight: "bold",
 },
 errorCard: {
   backgroundColor: "#fee",
   padding: 16,
   borderRadius: 10,
   marginBottom: 20,
 },
 errorText: {
   color: "#c00",
   textAlign: "center",
 },
});
