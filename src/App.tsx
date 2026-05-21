import MainContent from './components/MainContent';
import { wishlist } from './wishlist';

export default function App() {
  return <MainContent items={wishlist} />;
}
