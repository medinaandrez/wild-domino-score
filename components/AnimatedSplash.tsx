import { Image, StyleSheet, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

const BG = "#1e293b";

interface Props {
  onDone: () => void;
}

export default function AnimatedSplash({ onDone }: Props) {
  const iconOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. Icon fades in over 600ms
    iconOpacity.value = withTiming(1, { duration: 600 }, () => {
      // 2. Hold 400ms, then fade out entire overlay
      overlayOpacity.value = withDelay(
        400,
        withTiming(0, { duration: 500 }, () => {
          runOnJS(onDone)();
        })
      );
    });
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[st.overlay, overlayStyle]}>
      <View style={st.center}>
        <Animated.View style={[st.iconWrap, iconStyle]}>
          <Image
            source={require("@/assets/icon.png")}
            style={st.icon}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    zIndex: 999,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 32,
    overflow: "hidden",
  },
  icon: {
    width: 140,
    height: 140,
  },
});
