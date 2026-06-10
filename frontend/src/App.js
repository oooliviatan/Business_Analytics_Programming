import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StockAnalysisPage from "@/pages/StockAnalysisPage";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<StockAnalysisPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
