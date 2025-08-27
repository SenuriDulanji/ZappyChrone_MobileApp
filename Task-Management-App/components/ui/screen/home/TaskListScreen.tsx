import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/constants/firebaseConfig';

interface Task {
    id: string;
    title: string;
    dueDate: string;
    dueTime: string;
    priority: 'high' | 'medium' | 'low';
    isCompleted: boolean;
    hasLocation: boolean;
    hasWeather: boolean;
    userId: string;
    createdAt: any;
}

interface TaskListScreenProps {
    navigation: any;
}

export default function TaskListScreen({ navigation }: TaskListScreenProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'today' | 'overdue'>('all');

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        // Real-time listener for tasks using web Firebase SDK
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(
            tasksQuery,
            (querySnapshot) => {
                const fetchedTasks: Task[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedTasks.push({
                        id: doc.id,
                        ...doc.data(),
                    } as Task);
                });

                // Sort by createdAt manually since web SDK query doesn't support orderBy with where
                fetchedTasks.sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return b.createdAt.seconds - a.createdAt.seconds;
                    }
                    return 0;
                });

                setTasks(fetchedTasks);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching tasks:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return '#FF3B30';
            case 'medium':
                return '#FF9500';
            case 'low':
                return '#34C759';
            default:
                return '#007AFF';
        }
    };

    const toggleTaskComplete = async (id: string) => {
        try {
            const task = tasks.find(t => t.id === id);
            if (task) {
                const taskRef = doc(db, 'tasks', id);
                await updateDoc(taskRef, {
                    isCompleted: !task.isCompleted,
                });
            }
        } catch (error) {
            console.error('Error updating task:', error);
            Alert.alert('Error', 'Failed to update task. Please try again.');
        }
    };

    const deleteTask = (id: string) => {
        Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const taskRef = doc(db, 'tasks', id);
                            await deleteDoc(taskRef);
                        } catch (error) {
                            console.error('Error deleting task:', error);
                            Alert.alert('Error', 'Failed to delete task. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    // Filter tasks based on selected filter
    const filteredTasks = tasks.filter(task => {
        const today = new Date().toISOString().split('T')[0];
        switch (filter) {
            case 'today':
                return task.dueDate === today;
            case 'overdue':
                return task.dueDate < today && !task.isCompleted;
            default:
                return true;
        }
    });

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (dateString === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateString === yesterday.toISOString().split('T')[0]) {
            return 'Yesterday';
        } else if (dateString === tomorrow.toISOString().split('T')[0]) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString();
        }
    };

    const renderTask = ({item}: { item: Task }) => (
        <TouchableOpacity
            style={[styles.taskItem, item.isCompleted && styles.completedTaskItem]}
            onPress={() => navigation.navigate('AddEditTask', {task: item})}
            onLongPress={() => deleteTask(item.id)}
        >
            <View style={styles.taskContent}>
                <TouchableOpacity
                    style={[styles.checkbox, item.isCompleted && styles.checkboxCompleted]}
                    onPress={() => toggleTaskComplete(item.id)}
                >
                    {item.isCompleted && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>

                <View style={styles.taskDetails}>
                    <Text style={[styles.taskTitle, item.isCompleted && styles.completedTask]}>
                        {item.title}
                    </Text>
                    <Text style={styles.taskTime}>
                        {formatDate(item.dueDate)} at {formatTime(item.dueTime)}
                    </Text>
                </View>

                <View style={styles.taskIcons}>
                    <View style={[styles.priorityDot, {backgroundColor: getPriorityColor(item.priority)}]}/>
                    {item.hasLocation && <Text style={styles.icon}>📍</Text>}
                    {item.hasWeather && <Text style={styles.icon}>🌤️</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF"/>
                <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddEditTask')}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
                        All ({tasks.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'today' && styles.activeFilter]}
                    onPress={() => setFilter('today')}
                >
                    <Text style={[styles.filterText, filter === 'today' && styles.activeFilterText]}>
                        Today ({tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'overdue' && styles.activeFilter]}
                    onPress={() => setFilter('overdue')}
                >
                    <Text style={[styles.filterText, filter === 'overdue' && styles.activeFilterText]}>
                        Overdue
                        ({tasks.filter(t => t.dueDate < new Date().toISOString().split('T')[0] && !t.isCompleted).length})
                    </Text>
                </TouchableOpacity>
            </View>

            {filteredTasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {filter === 'all' ? 'No tasks yet' :
                            filter === 'today' ? 'No tasks for today' :
                                'No overdue tasks'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {filter === 'all' ? 'Tap the + button to add your first task' :
                            filter === 'today' ? 'Great! You\'re all caught up for today' :
                                'You\'re up to date!'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTask}
                    style={styles.taskList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeFilter: {
        backgroundColor: '#007AFF',
    },
    filterText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#fff',
    },
    taskList: {
        flex: 1,
        padding: 16,
    },
    taskItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    completedTaskItem: {
        opacity: 0.7,
    },
    taskContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxCompleted: {
        backgroundColor: '#007AFF',
    },
    checkmark: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    taskDetails: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
        color: '#333',
    },
    completedTask: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    taskTime: {
        fontSize: 14,
        color: '#666',
    },
    taskIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    icon: {
        fontSize: 16,
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
});
