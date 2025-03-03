import { Image, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Coinbase Onramp SDK Examples</ThemedText>
        <ThemedText>
          This app demonstrates how to use the Coinbase Onramp SDK in a React Native application.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.buttonContainer}>
        <Link href="/(tabs)/coinbase" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>SDK Tester</ThemedText>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/basic-example" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Basic Example</ThemedText>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/one-click-buy" asChild>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>One-Click Buy Example</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">About the Examples</ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Basic Example:</ThemedText> A simple implementation that shows how to initialize the SDK, fetch supported assets, and start a purchase flow.
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">One-Click Buy Example:</ThemedText> Demonstrates how to generate quotes and create one-click buy URLs for a streamlined purchase experience.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">SDK Tester</ThemedText>
        <ThemedText>
          The SDK Tester tab provides a comprehensive interface to test all the SDK's functionality, including initialization, configuration, quotes, and more.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0052FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
