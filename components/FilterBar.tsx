import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Priority = 'all' | 'low' | 'medium' | 'high';
type Status = 'all' | 'completed' | 'incomplete';

interface FilterBarProps {
  priorityFilter: Priority;
  statusFilter: Status;
  onPriorityChange: (priority: Priority) => void;
  onStatusChange: (status: Status) => void;
}

export default function FilterBar({
  priorityFilter,
  statusFilter,
  onPriorityChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Priority</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              priorityFilter === 'all' && styles.activeFilter,
            ]}
            onPress={() => onPriorityChange('all')}
          >
            <Text
              style={[
                styles.filterText,
                priorityFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              priorityFilter === 'low' && styles.activeFilter,
              priorityFilter === 'low' && { backgroundColor: '#E8F5E9' },
            ]}
            onPress={() => onPriorityChange('low')}
          >
            <View style={priorityDot('low')} />
            <Text
              style={[
                styles.filterText,
                priorityFilter === 'low' && styles.activeFilterText,
              ]}
            >
              Low
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              priorityFilter === 'medium' && styles.activeFilter,
              priorityFilter === 'medium' && { backgroundColor: '#FFF8E1' },
            ]}
            onPress={() => onPriorityChange('medium')}
          >
            <View style={priorityDot('medium')} />
            <Text
              style={[
                styles.filterText,
                priorityFilter === 'medium' && styles.activeFilterText,
              ]}
            >
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              priorityFilter === 'high' && styles.activeFilter,
              priorityFilter === 'high' && { backgroundColor: '#FFEBEE' },
            ]}
            onPress={() => onPriorityChange('high')}
          >
            <View style={priorityDot('high')} />
            <Text
              style={[
                styles.filterText,
                priorityFilter === 'high' && styles.activeFilterText,
              ]}
            >
              High
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Status</Text>
        <View style={styles.filterOptions}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              statusFilter === 'all' && styles.activeFilter,
            ]}
            onPress={() => onStatusChange('all')}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              statusFilter === 'completed' && styles.activeFilter,
            ]}
            onPress={() => onStatusChange('completed')}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={statusFilter === 'completed' ? '#4CAF50' : '#757575'}
              style={styles.statusIcon}
            />
            <Text
              style={[
                styles.filterText,
                statusFilter === 'completed' && styles.activeFilterText,
              ]}
            >
              Completed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterOption,
              statusFilter === 'incomplete' && styles.activeFilter,
            ]}
            onPress={() => onStatusChange('incomplete')}
          >
            <Ionicons
              name="ellipse-outline"
              size={16}
              color={statusFilter === 'incomplete' ? '#2196F3' : '#757575'}
              style={styles.statusIcon}
            />
            <Text
              style={[
                styles.filterText,
                statusFilter === 'incomplete' && styles.activeFilterText,
              ]}
            >
              Incomplete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const priorityDot = (priority: string) => ({
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor:
    priority === 'low'
      ? '#4CAF50'
      : priority === 'medium'
        ? '#FFC107'
        : '#F44336',
  marginRight: 6,
})
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#E3F2FD',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
  },
  activeFilterText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  statusIcon: {
    marginRight: 6,
  },
});