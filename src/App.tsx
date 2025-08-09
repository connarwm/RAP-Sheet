import { BrowserRouter, Routes, Route } from "react-router-dom"
import SidebarLayout from "./components/layout/SidebarLayout"
import Home from "./pages/Home"
import CableMapperPage from "./pages/CableMapperPage"
import PRDRAPsPage from "./pages/PRDRAPsPage"
import WeirdRAPsPage from "./pages/WeirdRAPsPage"
import MileageCalculatorPage from "./pages/MileageCalculatorPage"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SidebarLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/apps/network-raps" element={<CableMapperPage />} />
          <Route path="/apps/prd-raps" element={<PRDRAPsPage />} />
          <Route path="/apps/weird-raps" element={<WeirdRAPsPage />} />
          <Route path="/apps/mileage-calculator" element={<MileageCalculatorPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
