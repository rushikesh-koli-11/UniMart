import React, { useEffect, useState } from "react";
import API from "../api/api";
import Slider from "./Slider";

export default function SliderWrapper() {
  const [sliderImages, setSliderImages] = useState([]);

  const loadSlider = async () => {
    try {
      const { data } = await API.get("/slider");
      setSliderImages(data);
    } catch (err) {
      console.error("Slider loading error:", err);
    }
  };

  useEffect(() => {
    loadSlider();
  }, []);

  return <Slider sliderImages={sliderImages} />;
}
