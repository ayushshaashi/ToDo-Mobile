import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getAuth } from "firebase/auth";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebaseConfig";
const auth = getAuth();

type Priority = "low" | "medium" | "high";

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: {
    id?: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    isCompleted: boolean;
  }) => void;
  initialValues?: {
    id?: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    isCompleted: boolean;
  };
}

// At the top of the file or in a separate types.ts file
export type TaskType = {
  id?: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: "low" | "medium" | "high";
  isCompleted: boolean;
};

export default function TaskForm({
  visible,
  onClose,
  onSave,
  initialValues,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState<Priority>("high");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title);
      setDescription(initialValues.description);
      setDueDate(new Date(initialValues.dueDate));
      setPriority(initialValues.priority);
      setIsCompleted(initialValues.isCompleted);
    } else {
      // Set default values for new task
      setTitle("");
      setDescription("");
      setDueDate(new Date());
      setPriority("high");
      setIsCompleted(false);
    }
    setErrors({});
  }, [initialValues, visible]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (task: TaskType) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      if (task.id) {
        await setDoc(doc(db, "users", user.uid, "tasks", task.id), task);
      } else {
        const docRef = await addDoc(
          collection(db, "users", user.uid, "tasks"),
          {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            isCompleted: task.isCompleted,
          }
        );

        await setDoc(doc(db, "users", user.uid, "tasks", docRef.id), {
          id: docRef.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          isCompleted: task.isCompleted,
        });
      }
      console.log("Task saved to Firestore");
      onClose(); // close modal after save
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const formattedDate = dueDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });

  // Function to show date picker based on platform
  const showDatePickerModal = () => {
    if (Platform.OS === "android") {
      setShowDatePicker(true);
    } else {
      // iOS shows the picker inline
      setShowDatePicker(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.title}>Add a new task</Text>
          <Text style={styles.subtitle}>
            It&apos;s always good to stay organised! Kudos!
          </Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder=""
              placeholderTextColor="#666"
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder=""
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
            />

            <View style={styles.rowContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.label}>Due Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={showDatePickerModal}
                >
                  <Text style={styles.dateText}>{formattedDate}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.statusContainer}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      !isCompleted && styles.statusButtonActive,
                    ]}
                    onPress={() => setIsCompleted(false)}
                  >
                    <Text style={styles.statusText}>Incomplete</Text>
                    <Text style={styles.statusSubtext}>(Default)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      isCompleted && styles.statusButtonActive,
                    ]}
                    onPress={() => setIsCompleted(true)}
                  >
                    <Text style={styles.statusText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Date Picker for iOS */}
            {Platform.OS === "ios" && showDatePicker && (
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  style={styles.datePicker}
                />
                <TouchableOpacity
                  style={styles.datePickerDoneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Date Picker for Android is shown as a modal automatically */}
            {Platform.OS === "android" && showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === "high" && styles.priorityButtonActive,
                ]}
                onPress={() => setPriority("high")}
              >
                <Text style={styles.priorityText}>High</Text>
                <Text style={styles.prioritySubtext}>(Default)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === "medium" && styles.priorityButtonActive,
                ]}
                onPress={() => setPriority("medium")}
              >
                <Text style={styles.priorityText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.priorityButton,
                  priority === "low" && styles.priorityButtonActive,
                ]}
                onPress={() => setPriority("low")}
              >
                <Text style={styles.priorityText}>Low</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!validateForm()) return; // basic title validation
                handleSave({
                  id: initialValues?.id,
                  title,
                  description,
                  dueDate,
                  priority,
                  isCompleted,
                });
              }}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B3D1FF", // Light blue background
    fontFamily: "Space Grotesk",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  closeButton: {
    padding: 5,
  },
  profileButton: {
    padding: 5,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginTop: 20,
    fontFamily: "Space Grotesk",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
    marginBottom: 20,
    fontFamily: "Space Grotesk",
  },
  formContainer: {
    backgroundColor: "#1A1A1A", // Black form container
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#fff",
    fontFamily: "Space Grotesk",
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#fff",
    fontFamily: "Space Grotesk",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#F44336",
    marginTop: -12,
    marginBottom: 16,
    fontSize: 12,
    fontFamily: "Space Grotesk",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
    marginRight: 8,
  },
  statusContainer: {
    flex: 1,
    marginLeft: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Space Grotesk",
  },
  datePickerContainer: {
    backgroundColor: "#333",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  datePicker: {
    backgroundColor: "#333",
  },
  datePickerDoneButton: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "#444",
  },
  datePickerDoneText: {
    color: "#B3D1FF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Space Grotesk",
  },
  statusButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  statusButtonActive: {
    backgroundColor: "#555",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Space Grotesk",
  },
  statusSubtext: {
    color: "#999",
    fontSize: 10,
    fontFamily: "Space Grotesk",
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  priorityButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
  priorityButtonActive: {
    backgroundColor: "#555",
  },
  priorityText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Space Grotesk",
  },
  prioritySubtext: {
    color: "#999",
    fontSize: 10,
    fontFamily: "Space Grotesk",
  },
  createButton: {
    backgroundColor: "#B3D1FF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "Space Grotesk",
  },
});
