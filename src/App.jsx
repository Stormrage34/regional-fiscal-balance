import { LocaleProvider } from './context/LocaleContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import NakedBudget from '../NakedBudget.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <NakedBudget />
      </LocaleProvider>
    </ThemeProvider>
  );
}
