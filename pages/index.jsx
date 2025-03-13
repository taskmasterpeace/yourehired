import CAPTAINGui from "../captain_gui";
import { AppProvider } from "../context/context";

export default function Home() {
  return (
    <AppProvider>
      <CAPTAINGui />
    </AppProvider>
  );
}
