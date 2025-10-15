import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { RemoteAudioPlayer } from './RemoteAudioPlayer';
import { LocalAudioPlayer } from './LocalAudioPlayer';
import { AudioTester } from './AudioTester';

type TabType = 'remote' | 'local' | 'tests';

export const TabNavigator = () => {
  const [activeTab, setActiveTab] = useState<TabType>('remote');

  const renderTabButton = (tab: TabType, title: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'remote':
        return <RemoteAudioPlayer />;
      case 'local':
        return <LocalAudioPlayer />;
      case 'tests':
        return <AudioTester />;
      default:
        return <RemoteAudioPlayer />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        {renderTabButton('remote', 'Remote Audio')}
        {renderTabButton('local', 'Local Audio')}
        {renderTabButton('tests', 'Tests')}
      </View>
      <View style={styles.contentContainer}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  activeTabButton: {
    backgroundColor: '#1976D2',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
  },
});
