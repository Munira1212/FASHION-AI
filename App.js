/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FashionRecommendationScreen from './FashionRecommendationScreen';
import DreamWardrobeScreen from './DreamWardrobeScreen';
import DreamClosetScreen from './DreamClosetScreen';
import AiButtom from "./AiButtom";
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FashionRecommendation">
        <Stack.Screen 
          name="FashionRecommendation" 
          component={FashionRecommendationScreen} 
          options={{ title: 'Style Finder AI', headerShown: false }} 
        />
        <Stack.Screen 
          name="DreamWardrobe" 
          component={DreamWardrobeScreen} 
          options={{ title: 'Dream Wardrobe', headerShown: false }} 
        />
        <Stack.Screen 
      name="DreamCloset" 
        component={DreamClosetScreen}
      />
              <Stack.Screen 
      name="AiButtom" 
        component={AiButtom}
/>

        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;*/

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import your existing screens
import FashionRecommendationScreen from './FashionRecommendationScreen';
import DreamWardrobeScreen from './DreamWardrobeScreen';
import DreamClosetScreen from './DreamClosetScreen';

// Import the Visual Fashion Matcher component
import VisualFashionMatcherScreen from './VisualFashionMatcherScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Function to create stacks for each main screen if needed
const FashionRecommendationStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="StyleFinderMain" 
        component={FashionRecommendationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const WardrobeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="WardrobeMain" 
        component={DreamWardrobeScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const ClosetStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ClosetMain" 
        component={DreamClosetScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const VisualMatcherStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="VisualMatcherMain" 
        component={VisualFashionMatcherScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        let iconName;
        if (route.name === 'StyleFinder') {
          iconName = isFocused ? 'search-circle' : 'search-circle-outline';
        } else if (route.name === 'DreamWardrobe') {
          iconName = isFocused ? 'shirt' : 'shirt-outline';
        } else if (route.name === 'DreamCloset') {
          iconName = isFocused ? 'cube' : 'cube-outline';
        } else if (route.name === 'VisualMatcher') {
          iconName = isFocused ? 'camera' : 'camera-outline';
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <Ionicons 
              name={iconName} 
              size={24} 
              color={isFocused ? '#007BFF' : '#8E8E93'} 
            />
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? '#007BFF' : '#8E8E93' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen 
            name="StyleFinder" 
            component={FashionRecommendationStack} 
            options={{ title: 'Style' }}
          />
          <Tab.Screen 
            name="DreamWardrobe" 
            component={WardrobeStack} 
            options={{ title: 'Wardrobe' }}
          />
          <Tab.Screen 
            name="VisualMatcher" 
            component={VisualMatcherStack} 
            options={{ title: 'Matcher' }}
          />
          <Tab.Screen 
            name="DreamCloset" 
            component={ClosetStack} 
            options={{ title: 'Closet' }}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  }
});

export default App;