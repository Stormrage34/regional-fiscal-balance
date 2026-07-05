import { LocaleProvider } from './context/LocaleContext.jsx';
import NakedBudget from '../NakedBudget.jsx';

export default function App() {
  return (
    <LocaleProvider>
      <NakedBudget />
    </LocaleProvider>
  );
}
