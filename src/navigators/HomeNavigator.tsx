import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { HomeScreen } from '../screens/HomeScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { Home, Trophy, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export function HomeNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#5EBFB5',
        tabBarInactiveTintColor: '#6B6760',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
