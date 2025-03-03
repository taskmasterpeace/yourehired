"use client"

import CAPTAINGui from "../captain_gui"
import { AppProvider } from "@/context/context"

export default function SyntheticV0PageForDeployment() {
  return (
    <AppProvider>
      <CAPTAINGui />
    </AppProvider>
  )
}
