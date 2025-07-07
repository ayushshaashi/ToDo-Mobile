import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { auth, db } from "./../../firebaseConfig";

import TaskCard from "../../components/TaskCard";
import TaskForm from "../../components/TaskForm";

type Priority = "low" | "medium" | "high";
type FilterPriority = "all" | Priority;
type FilterStatus = "all" | "completed" | "incomplete";
type SortOption = "dueDate" | "priority" | "status";
type SortDirection = "asc" | "desc";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  isCompleted: boolean;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isLoading, setIsLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    console.log("Current user uid:", user?.uid);
    if (!user) {
      toast.error("Not logged in", {
        description: "Please log in to view your tasks",
      });
      router.replace("/");
      return;
    }

    const tasksQuery = query(
      collection(db, "users", user.uid, "tasks"),
      orderBy("dueDate", "asc")
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (querySnapshot) => {
        console.log("onSnapshot triggered, doc count:", querySnapshot.size);
        const loadedTasks: Task[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedTasks.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            dueDate: data.dueDate.toDate
              ? data.dueDate.toDate()
              : new Date(data.dueDate),
            priority: data.priority,
            isCompleted: data.isCompleted,
          });
        });
        console.log("Real-time loaded tasks:", loadedTasks);
        setTasks(loadedTasks);
        setFilteredTasks(loadedTasks);
        setIsLoading(false);
      },
      (error) => {
        toast.error("Failed to load tasks", {
          description: "Please try again later",
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...tasks];

    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    if (statusFilter === "completed") {
      result = result.filter((task) => task.isCompleted);
    } else if (statusFilter === "incomplete") {
      result = result.filter((task) => !task.isCompleted);
    }

    if (sortBy === "dueDate") {
      result = result.sort((a, b) => {
        const comparison = a.dueDate.getTime() - b.dueDate.getTime();
        return sortDirection === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "priority") {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      result = result.sort((a, b) => {
        const comparison =
          priorityWeight[b.priority as keyof typeof priorityWeight] -
          priorityWeight[a.priority as keyof typeof priorityWeight];
        return sortDirection === "asc" ? -comparison : comparison;
      });
    } else if (sortBy === "status") {
      result = result.sort((a, b) => {
        const comparison =
          a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    console.log("Filtered tasks count:", result.length);
    console.log("Filtered tasks:", result);

    setFilteredTasks(result);
  }, [tasks, priorityFilter, statusFilter, sortBy, sortDirection]);

  const handleAddTask = () => {
    setEditingTask(null);
    setShowAddTaskForm(true);
    setShowSidebar(false);
  };

  const handleEditTask = (id: string) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setShowAddTaskForm(true);
    }
  };

  const handleDeleteTask = async (id: string) => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("Not authorized to delete this task");
      return;
    }
    const taskToDelete = tasks.find((task) => task.id === id);
    if (!taskToDelete) {
      toast.error("Task not found");
      return;
    }
    try {
      console.log("Deleting task with id:", id);
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
      console.log("Task deleted successfully:", id);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      toast.success("Task deleted", {
        description: "The task has been removed",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task", {
        description: "Please try again later",
      });
    }
  };

  const handleToggleComplete = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;

    const updatedStatus = !taskToUpdate.isCompleted;

    try {
      await setDoc(
        doc(db, "users", user.uid, "tasks", id),
        {
          ...taskToUpdate,
          isCompleted: updatedStatus,
        },
        { merge: true }
      );
    } catch (error) {
      toast.error("Failed to toggle completion");
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
    setShowPriorityDropdown(false);
    setShowStatusDropdown(false);
  };

  const handleLogout = () => {
    router.replace("/");
  };

  const handleSaveTask = async (task: {
    id?: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: Priority;
    isCompleted: boolean;
  }) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const taskData = {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        isCompleted: task.isCompleted,
      };

      if (task.id) {
        // Update task
        await setDoc(doc(db, "users", user.uid, "tasks", task.id), {
          ...taskData,
          id: task.id,
        });
        toast.success("Task updated", { description: "Changes saved" });
      } else {
        // Add new task
        const docRef = await addDoc(
          collection(db, "users", user.uid, "tasks"),
          taskData
        );
        await setDoc(docRef, { ...taskData, id: docRef.id });
        toast.success("Task created", {
          description: "Task added successfully",
        });
      }

      setShowAddTaskForm(false);
      setIsLoading(true);
    } catch (error) {
      toast.error("Error saving task", {
        description: "Something went wrong",
      });
    }
  };

  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(option);
      setSortDirection("asc");
    }
  };

  const handlePriorityFilterChange = (priority: FilterPriority) => {
    setPriorityFilter(priority);
    setShowPriorityDropdown(false);
  };

  const handleStatusFilterChange = (status: FilterStatus) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const togglePriorityDropdown = () => {
    setShowPriorityDropdown(!showPriorityDropdown);
    setShowStatusDropdown(false);
  };

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
    setShowPriorityDropdown(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B3D1FF" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {showSidebar && (
        <View style={styles.sidebar}>
          <TouchableOpacity style={styles.closeButton} onPress={toggleSidebar}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Ionicons name="person" size={40} color="#333" />
            </View>
            <Text style={styles.profileName}>Ayush Shashi</Text>
          </View>

          <View style={styles.sidebarContent}>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={handleAddTask}
            >
              <Ionicons name="add" size={16} color="#B3D1FF" />
              <Text style={styles.addTaskButtonText}>Add a new task</Text>
            </TouchableOpacity>

            <Text style={styles.sidebarLabel}>Existing</Text>

            <ScrollView style={styles.sidebarTaskList}>
              {tasks.map((task) => (
                <View key={task.id} style={styles.sidebarTaskItem}>
                  <Text style={styles.sidebarTaskTitle}>{task.title}</Text>
                  <View style={styles.sidebarTaskMeta}>
                    <View style={styles.sidebarTaskDate}>
                      <Ionicons
                        name="calendar-outline"
                        size={12}
                        color="#999"
                      />
                      <Text style={styles.sidebarTaskDateText}>
                        {task.dueDate.getDate()} July
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityBadge,
                        task.priority === "high"
                          ? styles.highPriorityBadge
                          : task.priority === "medium"
                          ? styles.mediumPriorityBadge
                          : styles.lowPriorityBadge,
                      ]}
                    >
                      <Text style={styles.priorityText}>{task.priority}</Text>
                    </View>
                    <Text style={styles.statusText}>
                      {task.isCompleted ? "Complete" : "Incomplete"}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#F44336" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.mainContent, showSidebar && styles.blurredContent]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Manage</Text>
          <Text style={styles.title}>your tasks</Text>
        </View>

        <View style={styles.filtersOuterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContentContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === "dueDate" && styles.activeFilterButton,
              ]}
              onPress={() => handleSortChange("dueDate")}
            >
              <Text style={styles.filterText}>Sort by Date</Text>
              <Ionicons
                name={
                  sortBy === "dueDate" && sortDirection === "desc"
                    ? "arrow-down"
                    : "arrow-up"
                }
                size={16}
                color="#999"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === "priority" && styles.activeFilterButton,
              ]}
              onPress={() => handleSortChange("priority")}
            >
              <Text style={styles.filterText}>Sort by Priority</Text>
              <Ionicons
                name={
                  sortBy === "priority" && sortDirection === "desc"
                    ? "arrow-down"
                    : "arrow-up"
                }
                size={16}
                color="#999"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                priorityFilter !== "all" && styles.activeFilterButton,
              ]}
              onPress={togglePriorityDropdown}
            >
              <Text style={styles.filterText}>
                {priorityFilter === "all"
                  ? "All Priorities"
                  : `Priority: ${priorityFilter}`}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                statusFilter !== "all" && styles.activeFilterButton,
              ]}
              onPress={toggleStatusDropdown}
            >
              <Text style={styles.filterText}>
                {statusFilter === "all"
                  ? "All Status"
                  : statusFilter === "completed"
                  ? "Completed"
                  : "Incomplete"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#999" />
            </TouchableOpacity>
          </ScrollView>

          {showPriorityDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handlePriorityFilterChange("all")}
              >
                <Text style={styles.dropdownText}>All Priorities</Text>
                {priorityFilter === "all" && (
                  <Ionicons name="checkmark" size={16} color="#B3D1FF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handlePriorityFilterChange("high")}
              >
                <Text style={styles.dropdownText}>High</Text>
                {priorityFilter === "high" && (
                  <Ionicons name="checkmark" size={16} color="#B3D1FF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handlePriorityFilterChange("medium")}
              >
                <Text style={styles.dropdownText}>Medium</Text>
                {priorityFilter === "medium" && (
                  <Ionicons name="checkmark" size={16} color="#B3D1FF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handlePriorityFilterChange("low")}
              >
                <Text style={styles.dropdownText}>Low</Text>
                {priorityFilter === "low" && (
                  <Ionicons name="checkmark" size={16} color="#B3D1FF" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {showStatusDropdown && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleStatusFilterChange("all")}
              >
                <Text style={styles.dropdownText}>All Status</Text>
                {statusFilter === "all" && (
                  <Ionicons name="checkmark" size={16} color="#B3D1FF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleStatusFilterChange("completed")}
              >
                <Text style={styles.dropdownText}>Completed</Text>
                {statusFilter === "completed" && (
                  <Ionicons name="checkmark" size={16} color="#B3D1FF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleStatusFilterChange("incomplete")}
              >
                <Text style={styles.dropdownText}>Incomplete</Text>
                {statusFilter === "incomplete" && (
                  <Ionicons name="checkmark" size={16} color="#B3D1FF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {filteredTasks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>No tasks found</Text>
              <Text style={styles.emptySubtext}>
                {tasks.length > 0
                  ? "Try changing your filters"
                  : "Add a new task to get started"}
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredTasks.map((item) => (
                <TaskCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  dueDate={item.dueDate}
                  priority={item.priority}
                  isCompleted={item.isCompleted}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={handleAddTask}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TaskForm
        visible={showAddTaskForm}
        onClose={() => setShowAddTaskForm(false)}
        onSave={handleSaveTask}
        initialValues={editingTask || undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    fontFamily: "Space Grotesk",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#B3D1FF",
    fontFamily: "Space Grotesk",
  },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "70%",
    backgroundColor: "#1A1A1A",
    zIndex: 10,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 11,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Space Grotesk",
  },
  sidebarContent: {
    flex: 1,
    position: "relative",
  },
  sidebarTaskList: {
    flex: 1,
    marginBottom: 80,
  },
  sidebarLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15,
    marginTop: 20,
    fontFamily: "Space Grotesk",
  },
  sidebarTaskItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  sidebarTaskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
    fontFamily: "Space Grotesk",
  },
  sidebarTaskMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  sidebarTaskDate: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  sidebarTaskDateText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
    fontFamily: "Space Grotesk",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  highPriorityBadge: {
    backgroundColor: "#B3D1FF",
  },
  mediumPriorityBadge: {
    backgroundColor: "#888",
  },
  lowPriorityBadge: {
    backgroundColor: "#555",
  },
  priorityText: {
    fontSize: 10,
    color: "#1A1A1A",
    fontFamily: "Space Grotesk",
  },
  statusText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Space Grotesk",
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(179, 209, 255, 0.1)",
    padding: 12,
    borderRadius: 20,
    marginTop: 20,
    justifyContent: "center",
  },
  addTaskButtonText: {
    color: "#B3D1FF",
    marginLeft: 8,
    fontWeight: "500",
    fontFamily: "Space Grotesk",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    padding: 12,
    borderRadius: 20,
    justifyContent: "center",
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
  logoutText: {
    color: "#F44336",
    marginLeft: 8,
    fontWeight: "500",
    fontFamily: "Space Grotesk",
  },
  mainContent: {
    flex: 1,
  },
  blurredContent: {
    opacity: 0.3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: "#1A1A1A",
    zIndex: 5,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  profileButton: {
    padding: 4,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    lineHeight: 42,
    fontFamily: "Space Grotesk",
  },
  filtersOuterContainer: {
    position: "relative",
    zIndex: 2,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContentContainer: {
    paddingHorizontal: 20,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterButton: {
    backgroundColor: "#555",
  },
  filterText: {
    color: "#fff",
    marginRight: 6,
    fontSize: 14,
    fontFamily: "Space Grotesk",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 20,
    right: 20,
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 8,
    zIndex: 3,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  dropdownText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Space Grotesk",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#999",
    marginTop: 20,
    fontFamily: "Space Grotesk",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    fontFamily: "Space Grotesk",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#B3D1FF",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
