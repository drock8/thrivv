import React from 'react';
import { View, Text } from 'react-native';
import { User } from 'lucide-react-native';

export function ProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
      <User size={48} color="#5EBFB5" />
      <Text style={{ color: '#F5F2EA', fontSize: 22, fontWeight: '500', marginTop: 16 }}>
        Profile
      </Text>
      <Text style={{ color: '#6B6760', fontSize: 15, marginTop: 8 }}>
        Coming next
      </Text>
    </View>
  );
}
