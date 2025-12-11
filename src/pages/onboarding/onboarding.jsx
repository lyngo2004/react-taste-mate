import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input, Button, Typography, Spin, notification } from "antd";
import onboardingApi from "../../routers/onboardingApi";
import StepProgress from '../../components/onboarding/stepProgress';
import TagOption from '../../components/onboarding/tagOption';
import './onboarding.css'
const { Text } = Typography;
const TOTAL_STEPS = 5;

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const inputRef = useRef(null);

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [answersByQuestion, setAnswersByQuestion] = useState({});
    const [tempInput, setTempInput] = useState("");

    // -------- STEP LOGIC --------
    const currentStep = useMemo(() => {
        let step = Number(searchParams.get("step") || 1);
        if (step < 1) step = 1;
        if (step > TOTAL_STEPS) step = TOTAL_STEPS;
        return step;
    }, [searchParams]);

    // Auto scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep]);

    // Auto focus input for custom fields (q4, q5)
    useEffect(() => {
        if (inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 200); // đợi animation chạy
        }
    }, [currentStep]);


    const goToStep = (step) => {
        setSearchParams({ step: String(step) });
        setTempInput("");
    };

    const handleNext = () => {
        if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) goToStep(currentStep - 1);
    };

    const handleSkip = () => {
        if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
    };

    // -------- FETCH QUESTIONS --------
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await onboardingApi.getQuestions();
                const data = res?.DT || res;
                if (Array.isArray(data)) setQuestions(data);
            } catch (err) {
                console.error("Fetch onboarding questions error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    const currentQuestion = useMemo(() => {
        if (!questions.length) return null;
        return questions[currentStep - 1] || null;
    }, [questions, currentStep]);

    // -------- SELECT TAG --------
    const toggleSelect = (qid, option) => {
        setAnswersByQuestion((prev) => {
            const arr = prev[qid] || [];
            const exists = arr.includes(option);

            return {
                ...prev,
                [qid]: exists ? arr.filter((v) => v !== option) : [...arr, option],
            };
        });
    };

    // -------- CUSTOM INPUT (q4 + q5) --------
    const addCustomItem = () => {
        const trimmed = tempInput.trim();
        if (!trimmed) return;

        const qid = currentQuestion.id;

        setAnswersByQuestion((prev) => {
            const arr = prev[qid] || [];
            if (arr.includes(trimmed)) return prev;

            return {
                ...prev,
                [qid]: [...arr, trimmed],
            };
        });

        setTempInput("");
    };

    const removeDish = (d) => {
        const qid = "q5";
        setAnswersByQuestion((prev) => ({
            ...prev,
            [qid]: (prev[qid] || []).filter((x) => x !== d),
        }));
    };

    // -------- VALIDATION --------
    const validateAll = () => {
        if (!questions.length) return { ok: false, step: 1, message: "No questions loaded." };

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const ans = answersByQuestion[q.id];

            if (q.id === "q5") {
                if (!ans || ans.length < 5) {
                    return {
                        ok: false,
                        step: i + 1,
                        message: "Please provide 5 dishes that suit you best."
                    };
                }
            } else {
                if (!ans || ans.length === 0) {
                    return {
                        ok: false,
                        step: i + 1,
                        message: "Please answer this question before finishing."
                    };
                }
            }
        }

        return { ok: true };
    };

    // -------- BUILD PAYLOAD --------
    const buildPayload = () => {
        const q1 = answersByQuestion["q1"] || [];
        const q2 = answersByQuestion["q2"] || [];
        const q3 = answersByQuestion["q3"] || [];
        const q4 = answersByQuestion["q4"] || [];
        const q5 = answersByQuestion["q5"] || [];

        return {
            taste_tag: [...new Set([...q1, ...q2])],
            health_tag: q3,
            allergies: q4,
            top_dishes: q5,
        };
    };

    // -------- SUBMIT --------
    const handleFinish = async () => {
        const result = validateAll();

        if (!result.ok) {
            notification.warning({
                message: "Incomplete",
                description: result.message,
            });
            goToStep(result.step);
            return;
        }

        const payload = buildPayload();

        try {
            const res = await onboardingApi.submitAnswers(payload);

            notification.success({
                message: "Success",
                description: res?.EM || "Preferences saved successfully!",
            });

            navigate("/recommendations");
        } catch (err) {
            console.error(err);
            notification.error({
                message: "Error",
                description: "Failed to submit preferences.",
            });
        }
    };

    // -------- RENDER QUESTION --------
    const renderContent = () => {
        const q = currentQuestion;
        const qid = q.id;
        const selected = answersByQuestion[qid] || [];

        if (q.type === "multi") {
            return (
                <div className="onb-options-grid">
                    {q.options.map((opt) => (
                        <TagOption
                            key={opt}
                            label={opt}
                            selected={selected.includes(opt)}
                            onClick={() => toggleSelect(qid, opt)}
                        />
                    ))}

                    {q.allowCustomInput && (
                        <div className="onb-custom-input">
                            <Input
                                ref={inputRef}
                                placeholder={q.customInputPlaceholder}
                                value={tempInput}
                                onChange={(e) => setTempInput(e.target.value)}
                                onPressEnter={addCustomItem}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                Press Enter to add
                            </Text>
                        </div>
                    )}
                </div>
            );
        }

        if (q.type === "multi-text") {
            const dishes = selected;

            return (
                <div>
                    <Input
                        ref={inputRef}
                        placeholder={q.inputPlaceholder}
                        value={tempInput}
                        onChange={(e) => setTempInput(e.target.value)}
                        onPressEnter={addCustomItem}
                    />

                    <div style={{ marginTop: 12 }}>
                        {dishes.map((d) => (
                            <span key={d} className="dish-tag" onClick={() => removeDish(d)}>
                                {d} ✕
                            </span>
                        ))}
                    </div>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {dishes.length}/{q.maxItems} dishes added
                    </Text>
                </div>
            );
        }

        return <div>Unsupported question type</div>;
    };

    // -------- UI --------
    if (loading) {
        return (
            <div className="onboarding-wrapper">
                <div className="loading-box">
                    <Spin size="large" />
                    <p>Loading questions...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="onboarding-wrapper">
            <div className="onboarding-card">

                <div className="onboarding-left">
                    <StepProgress total={TOTAL_STEPS} current={currentStep} />
                </div>

                <div className="onboarding-right">
                    <p className="onb-step-label">
                        Step {currentStep} of {TOTAL_STEPS}
                    </p>

                    <h2 className="onb-title">{currentQuestion.question}</h2>
                    <p className="onb-subtitle">
                        {currentQuestion.type === "multi-text"
                            ? "Enter up to 5 dishes"
                            : "Select all that apply"}
                    </p>

                    <div key={currentStep} className="onb-content onb-animate">
                        {renderContent()}
                    </div>

                    <div className="onb-footer">

                        <button
                            className="footer-nav-btn"
                            disabled={currentStep === 1}
                            onClick={handlePrev}
                        >
                            <span className="arrow-icon">&lt;</span>
                        </button>

                        {currentStep < TOTAL_STEPS && (
                            <button className="footer-skip" onClick={handleSkip}>
                                Skip
                            </button>
                        )}

                        <button
                            className="footer-nav-btn primary"
                            onClick={currentStep === TOTAL_STEPS ? handleFinish : handleNext}
                        >
                            <span className="arrow-icon">
                                {currentStep === TOTAL_STEPS ? "✓" : ">"}
                            </span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;