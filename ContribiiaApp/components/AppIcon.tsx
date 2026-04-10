import {
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { StyleProp, TextStyle } from "react-native";

type Family = "material" | "community";

type IconConfig = {
  family: Family;
  name: string;
};

const ICON_MAP: Record<string, IconConfig> = {
  add: { family: "material", name: "add" },
  "arrow-forward": { family: "material", name: "arrow-forward" },
  "business-outline": { family: "material", name: "business-center" },
  "card-outline": { family: "material", name: "credit-card" },
  "checkmark": { family: "material", name: "check" },
  "checkmark-circle": { family: "material", name: "check-circle" },
  "chevron-back": { family: "material", name: "arrow-back" },
  "chevron-down": { family: "material", name: "keyboard-arrow-down" },
  "chevron-up": { family: "material", name: "keyboard-arrow-up" },
  close: { family: "material", name: "close" },
  "close-circle": { family: "material", name: "cancel" },
  "copy-outline": { family: "material", name: "content-copy" },
  "create-outline": { family: "material", name: "edit" },
  "document-text-outline": { family: "material", name: "description" },
  "download-outline": { family: "material", name: "download" },
  "ellipsis-horizontal-outline": {
    family: "material",
    name: "more-horiz",
  },
  "ellipsis-vertical": { family: "material", name: "more-vert" },
  "eye-off-outline": { family: "material", name: "visibility-off" },
  "eye-outline": { family: "material", name: "visibility" },
  filter: { family: "material", name: "filter-list" },
  "finger-print": { family: "material", name: "fingerprint" },
  "grid-outline": { family: "material", name: "dashboard" },
  "happy-outline": { family: "material", name: "face" },
  "home-outline": { family: "material", name: "home" },
  "lock-closed": { family: "material", name: "lock" },
  "logo-apple": { family: "community", name: "apple" },
  "paper-plane-outline": { family: "material", name: "send" },
  person: { family: "material", name: "person" },
  "person-outline": { family: "material", name: "person-outline" },
  "phone-portrait-outline": { family: "material", name: "smartphone" },
  "qr-code": { family: "material", name: "qr-code-2" },
  "qr-code-outline": { family: "material", name: "qr-code-2" },
  "receipt-outline": { family: "material", name: "receipt-long" },
  "share-outline": { family: "community", name: "share-variant-outline" },
  "speedometer-outline": { family: "material", name: "speed" },
  "swap-horizontal": { family: "material", name: "swap-horiz" },
  "swap-horizontal-outline": { family: "material", name: "swap-horiz" },
  "trash-outline": { family: "material", name: "delete-outline" },
  "wallet-outline": {
    family: "material",
    name: "account-balance-wallet",
  },
};

type AppIconProps = {
  name: string;
  size: number;
  color: string;
  style?: StyleProp<TextStyle>;
};

export default function AppIcon({
  name,
  size,
  color,
  style,
}: AppIconProps) {
  const icon = ICON_MAP[name];

  if (!icon || icon.family === "material") {
    return (
      <MaterialIcons
        name={(icon?.name ?? name) as React.ComponentProps<
          typeof MaterialIcons
        >["name"]}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return (
    <MaterialCommunityIcons
      name={icon.name as React.ComponentProps<
        typeof MaterialCommunityIcons
      >["name"]}
      size={size}
      color={color}
      style={style}
    />
  );
}
