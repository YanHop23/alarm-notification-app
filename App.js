import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated 
} from 'react-native';

const App = () => {
  const [ws, setWs] = useState(null);
  const [mode, setMode] = useState('CHECK');
  const [protection, setProtection] = useState('COLUMN'); //WARNING
  const [peopleCount, setPeopleCount] = useState(0);
  const [log, setLog] = useState([]);
  const [cyclicInterval, setCyclicInterval] = useState(null);
  const [isConnected, setIsConnected] = useState(false); 
  const positionValue = useRef(new Animated.Value(100)).current; // Анімація позиції кнопки

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.43.205:8080'); 

    socket.onopen = () => {
      addLog('Connected to WebSocket server.');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      addLog(`Server: ${event.data}`);
      checkMode(event.data)
      handleServerMessage(event.data);
    };

    socket.onerror = (error) => {
      addLog(`WebSocket error: ${error.message}`);
    };

    socket.onclose = () => {
      addLog('WebSocket connection closed.');
      setIsConnected(false);
    };

    setWs(socket);

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []); 

  useEffect(() => {
    if (isConnected) {
      startCyclicCommand(mode); 
      sendMessage('GET MODE');
    }
  }, [isConnected]);
  const changeMode = () => {
    sendMessage('CHANGE MODE')
    setMode((prevMode) => {
      const newMode = prevMode === 'CHECK' ? 'ALARM' : 'CHECK'; 
      startCyclicCommand(newMode); 
      return newMode; 
    });
    Animated.timing(positionValue, {
      toValue: mode=='ALARM' ? 100 : 0, // Позиція для кожного стану
      duration: 500,
      useNativeDriver: false,
    }).start();
  };
  const addLog = (entry) => {
    setLog((prevLog) => [...prevLog, entry]);
  };
  const checkMode=(message)=>{        
    if (message == 'Mode: COUNTER') {
      setMode('CHECK')
    } else if (message == 'Mode: ALARM') {
      setMode('ALARM')
    }
  }; 
  const stopToDebug = () => {
    clearInterval(cyclicInterval);
    setCyclicInterval(null);
    addLog('All stopped');
  };
  const sendMessage = (command) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(command);
      addLog(`Sent: ${command}`);
    } else {
      addLog('WebSocket is not connected.');
    }
  };
  const handleServerMessage = (message) => {
    try {
      if(message.length % 20 == 0 ) {
        setPeopleCount(message.length / 20)
      } else if (message == "Alarm triggered!") {
        setProtection("WARNING")
        stopToDebug();

      } else {
        setProtection("COLUMN")
        startCyclicCommand(mode)
      }
      } catch (error) {
      addLog('Error parsing server message.');
    }
  };
  const startCyclicCommand = (mode) => {
    clearInterval(cyclicInterval);
    setCyclicInterval(null);
    if (mode === 'ALARM') {
      addLog('Starting cyclic ALARM...');
      const interval = setInterval(() => sendMessage('CHECK ALARM'), 1000);
      setCyclicInterval(interval);
    } else if (mode === 'CHECK') {      addLog('Starting cyclic CHECK...');
      const interval = setInterval(() => sendMessage('GET DATA'), 1000);
      setCyclicInterval(interval);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView style={styles.logContainer}>
        {log.map((entry, index) => (
          <Text key={index} style={styles.logEntry}>
            {entry}
          </Text>
        ))}
      </ScrollView> */}

        {mode == 'CHECK' && (
          <View style={styles.header}>
            <Text style={styles.counterText}>Кількість людей: {peopleCount}</Text>
          </View>
        )}
        <Animated.View style={[styles.button, { top: positionValue }]}>
          <TouchableOpacity
            style={[styles.innerButton, mode == 'ALARM' ? styles.alarmButton : styles.normalButton]}
            onPress={changeMode}
          >
            <Text style={styles.buttonText}>
              {mode == 'ALARM' ? "Вимкнути сигналізацію" : "Увімкнути сигналізацію"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
          {/* <Button title="Stop" onPress={stopToDebug} /> */}
          {protection == 'WARNING' && (
            <View style={styles.alertView}>
              <Text style={styles.alertText} >Тривога!!!</Text>
              <TouchableOpacity 
                style={styles.buttonAlert}
                onPress={()=>{
                  sendMessage('TURN ALARM OFF')
                  setProtection('COLUMN')
                }}
              >
                <Text style={styles.buttonAlertText}>Вимкнути</Text>
              </TouchableOpacity>
            </View>
          )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logContainer: {
    flex: 1,
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logEntry: {
    marginBottom: 5,
    fontSize: 14,
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
  alertView: {
    position: "absolute",
    top: 600,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  alertText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "red",
    marginBottom: 20,
  },
  buttonAlert: {
    backgroundColor: '#4CAF50', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8,
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, 
  },
  buttonAlertText: {
    color: '#fff',
    fontSize: 16, 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
  },
});

export default App;
