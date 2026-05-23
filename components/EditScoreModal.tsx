import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "@/lib/theme";
import { wd } from "./WebConfirmDialog";

interface EditScoreModalProps {
  visible: boolean;
  roundNumber: number;
  playerName: string;
  value: string;
  onChangeValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  cancelLabel: string;
  title: string;
  hint: string;
  t: any;
}

export default function EditScoreModal({
  visible,
  roundNumber,
  playerName,
  value,
  onChangeValue,
  onSave,
  onCancel,
  saveLabel,
  cancelLabel,
  title,
  hint,
  t,
}: EditScoreModalProps) {
  if (!visible) return null;
  return (
    <View style={wd.overlay}>
      <View style={[wd.card, { backgroundColor: t.card }]}>
        <Text style={[{ fontSize: 17, fontWeight: "700", color: t.text, textAlign: "center", marginBottom: 4 }]}>
          {title}
        </Text>
        <Text style={[{ fontSize: 13, color: t.muted, textAlign: "center", marginBottom: 16 }]}>
          {hint}
        </Text>
        <TextInput
          style={[{ backgroundColor: t.cardAlt, color: t.text, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 16 }]}
          value={value}
          onChangeText={(v) => { if (/^\d*$/.test(v)) onChangeValue(v); }}
          keyboardType="number-pad"
          returnKeyType="done"
          autoFocus
          selectTextOnFocus
          onSubmitEditing={() => { Keyboard.dismiss(); onSave(); }}
        />
        <View style={wd.row}>
          <TouchableOpacity style={[wd.btn, { backgroundColor: t.cardAlt }]} onPress={() => { Keyboard.dismiss(); onCancel(); }}>
            <Text style={[wd.btnText, { color: t.text }]}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[wd.btn, { backgroundColor: colors.amber }]}
            onPress={() => { Keyboard.dismiss(); onSave(); }}
          >
            <Text style={[wd.btnText, { color: colors.onAmber }]}>{saveLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
