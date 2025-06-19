import React, { useEffect } from 'react';
import { Alert, Button } from 'react-native';
import config from '../config';

const TestConnection = () => {
  const testFetch = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/grupmuscular/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nom: 'test' }),
      });
      Alert.alert('Test fetch', `Status: ${response.status}`);
    } catch (error) {
      Alert.alert('Test fetch error', String(error));
    }
  };

  return <Button title="Test backend connection" onPress={testFetch} />;
};

export default TestConnection;
