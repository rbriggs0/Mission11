import { Route, Routes } from "react-router-dom";
import AdminBooks from "./AdminBooks";
import BookstorePage from "./BookstorePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<BookstorePage />} />
      <Route path="/adminbooks" element={<AdminBooks />} />
    </Routes>
  );
}
