import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';

const App = () => {
  return (
    // <AuthProvider> 
      <BrowserRouter>
        <AppRoutes />
        <ScrollToTop /> 
      </BrowserRouter>
    // </AuthProvider>
  );
};

export default App;