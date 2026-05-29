import React from 'react';
import { View, Text } from 'react-native';

interface StudentSearchPanelProps {
  accentColor?: string;
  scopeHint?: string;
}

export function StudentSearchPanel({ accentColor, scopeHint }: StudentSearchPanelProps) {
  return (
    <View style={{ padding: 16 }}>
      <Text>Student Search Panel ({scopeHint || 'All'})</Text>
    </View>
  );
}
