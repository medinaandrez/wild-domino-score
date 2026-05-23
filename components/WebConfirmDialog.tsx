import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/lib/theme";

interface WebConfirmDialogProps {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
  t: any;
}

export default function WebConfirmDialog({
  visible,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  t,
}: WebConfirmDialogProps) {
  if (!visible) return null;
  return (
    <View style={wd.overlay}>
      <View style={[wd.card, { backgroundColor: t.card }]}>
        <Text style={[wd.msg, { color: t.text }]}>{message}</Text>
        <View style={wd.row}>
          <TouchableOpacity style={[wd.btn, { backgroundColor: t.cardAlt }]} onPress={onCancel}>
            <Text style={[wd.btnText, { color: t.text }]}>{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[wd.btn, { backgroundColor: colors.red }]} onPress={onConfirm}>
            <Text style={[wd.btnText, { color: "#fff" }]}>{confirmLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export const wd = StyleSheet.create({
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", zIndex: 100 },
  card: { width: 300, borderRadius: 18, padding: 24, gap: 20 },
  msg: { fontSize: 16, lineHeight: 24, textAlign: "center" },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { fontSize: 15, fontWeight: "700" },
});
