/* import bootstrap module */
import { Carousel } from "bootstrap";
import React, { useEffect } from "react";
import "./Slider.css";

const Slider = ({ sliderImages }) => {
  useEffect(() => {
    setTimeout(() => {
      const carouselElement = document.getElementById("esevaSlider");
      if (!carouselElement) return;

      // Initialize Carousel using module, not global
      const bsCarousel =
        Carousel.getInstance(carouselElement) ||
        new Carousel(carouselElement);

      const imgs = carouselElement.querySelectorAll("img");

      imgs.forEach((img) => {
        img.addEventListener("mousedown", () => bsCarousel.pause());
        img.addEventListener("mouseup", () => bsCarousel.cycle());
        img.addEventListener("mouseleave", () => bsCarousel.cycle());

        img.addEventListener("touchstart", () => bsCarousel.pause());
        img.addEventListener("touchend", () => bsCarousel.cycle());
      });
    }, 600);
  }, [sliderImages]);

  return (
    <div
      id="esevaSlider"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="3000"
      data-bs-pause="false"
    >
      <div className="carousel-inner">
        {sliderImages?.length === 0 ? (
          <div className="carousel-item active">
            <div className="slider-img-wrapper">
              <img src="/placeholder.jpg" className="slider-img-responsive" />
              <div className="slider-timer-bar"></div>
            </div>
          </div>
        ) : (
          sliderImages.map((img, i) => (
            <div
              key={img._id}
              className={`carousel-item ${i === 0 ? "active" : ""}`}
            >
              <div className="slider-img-wrapper">

                {img.link ? (
                  <a
                    href={img.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="slider-link-wrapper"
                  >
                    <img src={img.imageUrl} className="slider-img-responsive" />
                  </a>
                ) : (
                  <img src={img.imageUrl} className="slider-img-responsive" />
                )}

                <div className="slider-timer-bar"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Slider;
