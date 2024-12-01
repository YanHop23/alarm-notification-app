import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

const App = () => {
  const [alarmOn, setAlarmOn] = useState(false); // Стан сигналізації
  const animatedValue = useRef(new Animated.Value(0)).current; // Анімація фону
  const positionValue = useRef(new Animated.Value(100)).current; // Анімація позиції кнопки

  const toggleAlarm = () => {
    setAlarmOn((prevState) => !prevState);

    // Плавна зміна фону
    Animated.timing(animatedValue, {
      toValue: alarmOn ? 0 : 1, // Перемикання між станами
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Плавна зміна позиції кнопки
    Animated.timing(positionValue, {
      toValue: alarmOn ? 100 : 0, // Позиція для кожного стану
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  // Інтерполяція кольору фону
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ffffff", "#ffdddd"], // Білий -> Червоний
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {!alarmOn && (
        <View style={styles.header}>
          <Text style={styles.counterText}>Кількість людей: 5</Text>
        </View>
      )}
      <Animated.View style={[styles.button, { top: positionValue }]}>
        <TouchableOpacity
          style={[styles.innerButton, alarmOn ? styles.alarmButton : styles.normalButton]}
          onPress={toggleAlarm}
        >
          <Text style={styles.buttonText}>
            {alarmOn ? "Вимкнути сигналізацію" : "Увімкнути сигналізацію"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 200,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  counterText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 230,
    height: 230,
  },
  innerButton: {
    top: 300,
    borderRadius: 115, // Кругла кнопка
    width: 230,
    height: 230,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  normalButton: {
    backgroundColor: "#4CAF50",
  },
  alarmButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default App;
