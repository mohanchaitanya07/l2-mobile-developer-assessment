import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    if (gameStarted) {
      const balloonMoveInterval = setInterval(() => {
        setBalloons(prevBalloons => {
          const newBalloons = prevBalloons.map(balloon => ({
            ...balloon,
            yPos: balloon.yPos - 5 // Adjust balloon speed here
          })).filter(balloon => balloon.yPos > - 5);

          // Check if any balloon reached the top
          const missedBalloons = prevBalloons.filter(balloon => balloon.yPos <= 0);
          if (missedBalloons.length > 0) {
            setScore(prevScore => (prevScore - 1) > 0 ? (prevScore - 1) : 0);
          }

          return newBalloons;
        });
      }, 100);
      return () => clearInterval(balloonMoveInterval);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        if (timeLeft === 0) {
          clearInterval(interval);
          gameOver();
        } else {
          setTimeLeft(prevTime => prevTime - 1);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, timeLeft]);

  const startGame = () => {
    setTimeLeft(120);
    setScore(0);
    setGameStarted(true);
    startGeneratingBalloons();
  };

  const startGeneratingBalloons = () => {
    const balloonInterval = setInterval(() => {
      const xPos = generateRandomNumber(width); // Adjusted width by subtracting the width of the balloon image
      setBalloons(prevBalloons => [...prevBalloons, { xPos, yPos: height, burstAnimation: new Animated.Value(0) }]);
    }, 2000);
    return () => clearInterval(balloonInterval);
  };

  function generateRandomNumber(x) {
    const randomNumber = Math.random();

    let result = randomNumber * x;

    if (result < 100) result += 100;
    else if (result > x - 100) result -= 100;

    return result - 200;
  }

  const gameOver = () => {
    Alert.alert(
      'Game Over',
      `Final Score: ${score}`,
      [{ text: 'Play Again', onPress: () => resetGame() }],
      { cancelable: false }
    );
  };

  const resetGame = () => {
    setGameStarted(false);
    setBalloons([]);
  };

  const popBalloon = index => {
    const newBalloons = [...balloons];
    const balloon = newBalloons[index];
    balloon.burstAnimation.setValue(0); // Reset the animation value
    newBalloons.splice(index, 1);
    setBalloons(newBalloons);
    setScore(prevScore => prevScore + 2);

    // Trigger burst animation for the clicked balloon
    Animated.sequence([
      Animated.timing(balloon.burstAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(balloon.burstAnimation, {
        toValue: 0,
        duration: 100,
        delay: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      {!gameStarted && (
        <TouchableOpacity onPress={startGame} style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Game</Text>
        </TouchableOpacity>
      )}
      {gameStarted && (
        <View style={styles.gameContainer}>
          <View style={styles.scoreCard}>
            <View style={styles.timeCardWrap}>
              <Image source={require('./assets/stopwatch.png')} style={{ height: 30, width: 30 }} />
              <Text style={styles.timer}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
            </View>
            <View style={styles.scoreCardWrap}>
              <Image source={require('./assets/coins.png')} style={{ height: 35, width: 35 }} />
              <Text style={styles.score}>Score: {score}</Text>
            </View>
          </View>
          <View style={{ position: 'absolute' }}>
            {balloons.map((balloon, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => popBalloon(index)}
                style={{
                  position: 'absolute',
                  left: balloon.xPos,
                  top: balloon.yPos,
                }}
              >
                <Animated.Image
                  source={require('./assets/balloon.png')}
                  style={[
                    { width: 50, height: 70 },
                    {
                      transform: [
                        {
                          scale: balloon.burstAnimation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [1, 4, 1],
                          }),
                        },
                      ],
                      opacity: balloon.burstAnimation.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 0.5, 0],
                      }),
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    height: "100%",
    width: "100%",
    backgroundColor: "#DDDDDD",
    paddingTop: "15%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  scoreCard: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  scoreCardWrap: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 40
  },
  timeCardWrap: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 40
  },
  container: {
    flex
      : 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontSize: 30,
    color: "red",
    fontWeight: "700"
  },
  score: {
    fontSize: 18,
    color: 'green',
    paddingLeft: 4,
    zIndex: 100
  },
  startButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  startButtonText: {
    fontSize: 20,
    color: '#fff',
  },
});
