import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import des écrans
import HomeScreen from '../screens/Home/HomeScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import FriendsScreen from '../screens/Friends/FriendsScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import { useAuth } from '../contexts/AuthContext';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Chat: undefined;
  Friends: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Chat: { userId: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Chat') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        } else if (route.name === 'Friends') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Accueil' }}
    />
    <Tab.Screen 
      name="Chat" 
      component={ChatListScreen}
      options={{ title: 'Messages' }}
    />
    <Tab.Screen 
      name="Friends" 
      component={FriendsScreen}
      options={{ title: 'Amis' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profil' }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user } = useAuth();

  if (!user) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          title: 'Chat',
          headerBackTitle: 'Retour',
        })}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 