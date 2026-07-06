import { LocaleProvider } from './context/LocaleContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import NakedBudget from './pages/NakedBudget';

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <NakedBudget />
      </LocaleProvider>
    </ThemeProvider>
  );
}
