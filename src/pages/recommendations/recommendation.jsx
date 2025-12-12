import React, { useEffect, useState } from "react";
import { Spin, Typography } from "antd";
import courseItemApi from "../../routers/courseItemApi";
import CourseCard from "../../components/course/courseCard";
import "./recommendation.css";

const { Title } = Typography;

const VISIBLE_COUNT = 4;

const categoriesConfig = [
    { key: "dessert", title: "Desserts" },
    { key: "appetizer", title: "Appetizers" },
    { key: "main-dish", title: "Main Dishes" },
];

const RecommendationsPage = () => {
    const [itemsByCategory, setItemsByCategory] = useState({
        dessert: [],
        appetizer: [],
        "main-dish": [],
    });

    const [loading, setLoading] = useState(true);

    // slider index cho từng category
    const [sliderIndex, setSliderIndex] = useState({
        dessert: 0,
        appetizer: 0,
        "main-dish": 0,
    });

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const rawResult = JSON.parse(localStorage.getItem("recommendResult")) || [];

                // 2) đúng field: courseId
                const mlResult = Array.isArray(rawResult)
                    ? rawResult.filter((x) => x && typeof x.courseId === "number")
                    : [];

                const idsInOrder = mlResult.map((x) => x.courseId);

                if (!idsInOrder.length) {
                    console.warn("No valid recommendation courseIds");
                    setLoading(false);
                    return;
                }

                // 3) gọi DB để lấy detail
                const res = await courseItemApi.getCourseItemsByIds(idsInOrder);
                if (!res || res.EC !== 0) {
                    setLoading(false);
                    return;
                }

                const courseList = res.DT || [];

                // Map courseId -> course
                const courseMap = new Map();
                courseList.forEach((c) => {
                    courseMap.set(String(c.courseId), c);
                });

                // Merge score + giữ order
                const mergedList = idsInOrder
                    .map((id, idx) => {

                        const course = courseMap.get(String(id));
                        if (!course) return null;

                        return {
                            ...course,
                            accuracy: Math.round((mlResult[idx].score || 0) * 100),
                        };
                    })
                    .filter(Boolean);

                // Chia theo category – GIỮ ORDER
                setItemsByCategory({
                    dessert: mergedList.filter((i) => i.category === "dessert"),
                    appetizer: mergedList.filter((i) => i.category === "appetizer"),
                    "main-dish": mergedList.filter((i) => i.category === "main-dish"),
                });
            } catch (err) {
                console.error("fetch recommendation error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
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
