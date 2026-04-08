import { Redirect } from "expo-router";

// Clubs screen has moved to the (clubs) route group.
export default function ClubsRedirect() {
  return <Redirect href="/(clubs)/clubs" />;
}
