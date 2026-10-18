import React from "react";
import BasicHooks from "./components/BasicHooks.js";
import AdvancedHooks, { ThemeProvider } from "./components/AdvancedHooks.js";
import CustomHooks from "./components/CustomHooks.js";
import HooksTests from "./components/HooksTests.js";
import "./App.css";
export default function App() {
  return (
    <ThemeProvider>
      <header>
        <p>МДК 07 · ПР16</p>
        <h1>ВелоКруг: лаборатория хуков</h1>
        <p>Состояние, эффекты и переиспользуемая логика</p>
      </header>
      <main>
        <BasicHooks />
        <AdvancedHooks />
        <CustomHooks />
        <HooksTests />
      </main>
      <footer>Учебные примеры · данные JSONPlaceholder</footer>
    </ThemeProvider>
  );
}
