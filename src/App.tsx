import { Route, Routes } from "react-router-dom";
import WelcomPage from "./pages/WelcomePage";
import PresentationPage from "./pages/PresentationPage";
import CreatePresentation from "./pages/CreatePresentation";
import ChangeSlides from "./pages/ChangeSlides";
import AllPresentation from "./pages/AllPresentation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomPage />} />
      <Route path={`/presentation/:id`} element={<PresentationPage />} />
      <Route path={`/allPresentation`} element={<AllPresentation />} />
      <Route path="/createPresentation" element={<CreatePresentation />} />{" "}
      <Route path="/slides/:id" element={<ChangeSlides />} />
    </Routes>
  );
}

export default App;
