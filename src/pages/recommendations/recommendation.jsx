// src/pages/recommendations/RecommendationsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Spin, Typography } from "antd";
import courseItemApi from "../../routers/courseItemApi";
import CourseCard from "../../components/course/courseCard";
import "./recommendation.css";

const { Title } = Typography;

const VISIBLE_COUNT = 4;
const MAX_PER_CATEGORY = 6;

const categoriesConfig = [
  { key: "dessert", title: "Desserts" },
  { key: "appetizer", title: "Appetizers" },
  { key: "main_dish", title: "Main Dishes" },
];

const getRandomSubset = (arr, max) => {
  const copy = [...arr];
  // shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, max);
};

const RecommendationsPage = () => {
  const [itemsByCategory, setItemsByCategory] = useState({
    dessert: [],
    appetizer: [],
    main_dish: [],
  });

  const [loading, setLoading] = useState(true);

  // slider index cho từng category
  const [sliderIndex, setSliderIndex] = useState({
    dessert: 0,
    appetizer: 0,
    main_dish: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await courseItemApi.getAllCourseItems();
        const data = res?.DT || res;

        if (!Array.isArray(data)) {
          console.error("Invalid course items data:", data);
          setLoading(false);
          return;
        }

        // group theo category
        const desserts = data.filter((i) => i.category === "dessert");
        const appetizers = data.filter((i) => i.category === "appetizer");
        const mainDishes = data.filter((i) => i.category === "main-dish");

        // random 6 items / category
        const randomDesserts = getRandomSubset(desserts, MAX_PER_CATEGORY);
        const randomAppetizers = getRandomSubset(appetizers, MAX_PER_CATEGORY);
        const randomMain = getRandomSubset(mainDishes, MAX_PER_CATEGORY);

        // thêm accuracy 80–99%
        const withAccuracy = (list) =>
          list.map((item) => ({
            ...item,
            accuracy: Math.floor(Math.random() * 20) + 80,
          }));

        setItemsByCategory({
          dessert: withAccuracy(randomDesserts),
          appetizer: withAccuracy(randomAppetizers),
          main_dish: withAccuracy(randomMain),
        });
      } catch (err) {
        console.error("fetch recommendation error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrev = (catKey) => {
    setSliderIndex((prev) => {
      const current = prev[catKey] || 0;
      if (current <= 0) return prev;
      return { ...prev, [catKey]: current - 1 };
    });
  };

  const handleNext = (catKey, total) => {
    setSliderIndex((prev) => {
      const current = prev[catKey] || 0;
      const maxIndex = Math.max(total - VISIBLE_COUNT, 0);
      if (current >= maxIndex) return prev;
      return { ...prev, [catKey]: current + 1 };
    });
  };

  if (loading) {
    return (
      <div className="rec-wrapper">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="rec-wrapper">
      <div className="rec-inner">

        <Title level={2} className="rec-main-title">
          Recommended Dishes for You
        </Title>

        {categoriesConfig.map(({ key, title }) => {
          const list = itemsByCategory[key] || [];
          if (!list.length) return null;

          const startIndex = sliderIndex[key] || 0;
          const visible = list.slice(
            startIndex,
            startIndex + VISIBLE_COUNT
          );
          const maxIndex = Math.max(list.length - VISIBLE_COUNT, 0);
          const disablePrev = startIndex === 0;
          const disableNext = startIndex >= maxIndex;

          return (
            <section key={key} className="rec-section">
              <div className="rec-header">
                <h3 className="rec-section-title">{title}</h3>
                <span className="rec-section-subtitle">
                  Based on your TasteMate profile
                </span>
              </div>

              <div className="rec-slider-row">
                <button
                  className="rec-arrow-btn"
                  disabled={disablePrev}
                  onClick={() => handlePrev(key)}
                >
                  &lt;
                </button>

                <div className="rec-cards-container">
                  {visible.map((item) => (
                    <CourseCard
                      key={item.courseId}
                      name={item.courseName}
                      imageUrl={item.imageUrl}
                      accuracy={item.accuracy}
                    />
                  ))}
                </div>

                <button
                  className="rec-arrow-btn"
                  disabled={disableNext}
                  onClick={() => handleNext(key, list.length)}
                >
                  &gt;
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationsPage;
