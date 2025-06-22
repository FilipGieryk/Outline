import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { DrawingPage } from "./pages/DrawingPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ImageProvider } from "./context/ImageContext.tsx";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ImageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/drawing" element={<DrawingPage />} />
          </Routes>
        </Router>
      </ImageProvider>
    </QueryClientProvider>
  );
}

export default App;
