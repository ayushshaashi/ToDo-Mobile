import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Priority = "low" | "medium" | "high";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({
  id,
  title,
  description,
  dueDate,
  priority,
  isCompleted,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  // All incomplete tasks are blue, completed tasks are dark
  const getCardColor = () => {
    return isCompleted ? "#333333" : "#B3D1FF";
  };

  return (
    <View style={[styles.card, { backgroundColor: getCardColor() }]}>
      <View style={styles.cardContent}>
        {/* Priority Badge */}
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.priorityBadge,
              !isCompleted
                ? styles.highPriorityBadge
                : priority === "medium"
                ? styles.mediumPriorityBadge
                : styles.lowPriorityBadge,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                !isCompleted
                  ? styles.highPriorityText
                  : styles.otherPriorityText,
              ]}
            >
              {priority === "high"
                ? "High"
                : priority === "medium"
                ? "Medium"
                : "Low"}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Text style={styles.completedText}>Complete</Text>
              </View>
            ) : (
              <View style={styles.incompleteBadge}>
                <Text style={styles.incompleteText}>Incomplete</Text>
                <TouchableOpacity
                  style={styles.markCompleteButton}
                  onPress={() => onToggleComplete(id)}
                >
                  <Text style={styles.markCompleteText}>Mark as Complete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Task Title - Show full title */}
        <Text
          style={[
            styles.title,
            !isCompleted ? styles.darkTitle : styles.lightTitle,
          ]}
        >
          {title}
        </Text>

        {/* Task Description - Show full description */}
        <Text
          style={[
            styles.description,
            !isCompleted ? styles.darkDescription : styles.lightDescription,
          ]}
        >
          {description}
        </Text>

        {/* Footer with date and actions */}
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={!isCompleted ? "#000" : "#ccc"}
            />
            <Text
              style={[
                styles.date,
                !isCompleted ? styles.darkDate : styles.lightDate,
              ]}
            >
              {formattedDate}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(id)}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color={!isCompleted ? "#000" : "#ccc"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(id)}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={!isCompleted ? "#000" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priorityBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  highPriorityBadge: {
    backgroundColor: "#fff",
  },
  mediumPriorityBadge: {
    backgroundColor: "#888",
  },
  lowPriorityBadge: {
    backgroundColor: "#555",
  },
  priorityText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Space Grotesk",
  },
  highPriorityText: {
    color: "#000",
  },
  otherPriorityText: {
    color: "#fff",
  },
  statusBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  incompleteBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  incompleteText: {
    color: "#fff",
    fontSize: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: "hidden",
    fontFamily: "Space Grotesk",
  },
  markCompleteButton: {
    marginLeft: 8,
  },
  markCompleteText: {
    color: "#fff",
    fontSize: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: "hidden",
    fontFamily: "Space Grotesk",
  },
  completedBadge: {
    backgroundColor: "#555",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  completedText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Space Grotesk",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "Space Grotesk",
  },
  darkTitle: {
    color: "#000",
  },
  lightTitle: {
    color: "#fff",
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Space Grotesk",
  },
  darkDescription: {
    color: "#333",
  },
  lightDescription: {
    color: "#ccc",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    marginLeft: 4,
    fontFamily: "Space Grotesk",
  },
  darkDate: {
    color: "#000",
  },
  lightDate: {
    color: "#ccc",
  },
  actions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 4,
    marginLeft: 12,
  },
});
