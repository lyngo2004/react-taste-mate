import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input, Button, Typography, Spin, notification } from "antd";
import onboardingApi from "../../routers/onboardingApi";
import mlRecommendApi from "../../routers/mlRecommendApi";
import courseItemApi from "../../routers/courseItemApi";
import StepProgress from '../../components/onboarding/stepProgress';
import TagOption from '../../components/onboarding/tagOption';
import './onboarding.css'
const { Text } = Typography;
const TOTAL_STEPS = 5;

const OnboardingPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [answersByQuestion, setAnswersByQuestion] = useState({});
    const [tempInput, setTempInput] = useState("");

    const [candidateOptions, setCandidateOptions] = useState([]); // options cho q5 (20 món)
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [finishing, setFinishing] = useState(false); // loading khi submit + recommend


    // -------- STEP LOGIC --------
    const currentStep = useMemo(() => {
        let step = Number(searchParams.get("step") || 1);
        if (step < 1) step = 1;
        if (step > TOTAL_STEPS) step = TOTAL_STEPS;
        return step;
    }, [searchParams]);

    const prepareQ5Candidates = async () => {
        setLoadingCandidates(true);

        try {
            const mlPayload = buildMLPayload();

            const candRes = await mlRecommendApi.getCandidates(mlPayload);
            const data = candRes?.DT || [];

            // sort by popularity desc
            const topIds = data
                .slice()
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 20)
                .map((x) => x.id);

            if (!topIds.length) {
                setCandidateOptions([]);
                return;
            }

            // 1 request duy nhất
            const courseRes = await courseItemApi.getCourseItemsByIds(topIds);
            if (!courseRes || courseRes.EC !== 0) {
                setCandidateOptions([]);
                return;
            }

            const courses = courseRes.DT || [];

            // Map courseId -> courseName để render tag
            const options = courses.map((c) => ({
                label: c.courseName,
                value: c.courseId, // seed_items sẽ là courseId
            }));

            console.log("ML candidates:", data);
            console.log("Top IDs:", topIds);
            console.log("Course res:", courseRes);


            setCandidateOptions(options);
        } catch (err) {
            console.error(err);
            setCandidateOptions([]);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const validateUpToStep4 = () => {
        for (let i = 1; i <= 4; i++) {
            const key = `q${i}`;
            const ans = answersByQuestion[key];
            if (!ans || (Array.isArray(ans) && ans.length === 0)) {
                return { ok: false, step: i, message: `Please answer question ${i} first.` };
            }
        }
        return { ok: true };
    };

    // Auto scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep]);

    const goToStep = (step) => {
        setSearchParams({ step: String(step) });
        setTempInput("");
    };

    const handleNext = async () => {
        if (currentStep === 4) {
            const v = validateUpToStep4();
            if (!v.ok) {
                notification.warning({ message: "Incomplete", description: v.message });
                goToStep(v.step);
                return;
            }

            await prepareQ5Candidates(); // gọi ML + map options
            goToStep(5);
            return;
        }

        if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) goToStep(currentStep - 1);
    };

    const handleSkip = () => {
        if (currentStep < 4) goToStep(currentStep + 1);
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

            if (exists) {
                return { ...prev, [qid]: arr.filter((v) => v !== option) };
            }

            if (qid === "q5" && arr.length >= 5) {
                notification.warning({
                    message: "Limit reached",
                    description: "You can only select 5 dishes.",
                });
                return prev;
            }

            return { ...prev, [qid]: [...arr, option] };
        });
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
    const buildMLPayload = () => {
        const q1 = answersByQuestion["q1"] || []; // cuisines (UI có thể viết hoa)
        const q2 = answersByQuestion["q2"] || []; // taste_tags (đúng format)
        const q3 = answersByQuestion["q3"] || []; // health_goals
        const q4 = answersByQuestion["q4"] || []; // avoid_ingredients

        return {
            preferences: {
                cuisines: q1.map((x) => String(x).toLowerCase()), // chỉ lowercase q1
                taste_tags: q2,
                health_goals: q3,
            },
            restrictions: {
                avoid_ingredients: q4,
            },
            seed_items: [],
        };
    };

    const buildPreferences = () => {
        const q1 = answersByQuestion["q1"] || [];
        const q2 = answersByQuestion["q2"] || [];
        const q3 = answersByQuestion["q3"] || [];
        const q4 = answersByQuestion["q4"] || [];
        const q5 = answersByQuestion["q5"] || [];

        return {
            cuisines: q1,
            taste_tags: q2,
            health_goals: q3,
            avoid_ingredients: q4,
            seed_items: q5,
        };
    };

    // -------- SUBMIT --------
    const handleFinish = async () => {
        // validate đủ 5 câu
        const result = validateAll();
        if (!result.ok) {
            notification.warning({ message: "Incomplete", description: result.message });
            goToStep(result.step);
            return;
        }

        const userId = localStorage.getItem("userId");
        const preferencesForDB = buildPreferences(); // giữ như cũ nhưng q5 giờ là seed_items IDs

        // seed items (courseId) để call recommend
        const seedItems = answersByQuestion["q5"] || [];

        setFinishing(true);

        try {
            // (A) lưu DB như cũ
            const saveRes = await onboardingApi.submitAnswers({
                userId,
                preferences: preferencesForDB,
            });

            if (saveRes?.EC !== 0) {
                notification.error({ message: "Error", description: saveRes?.EM || "Save failed" });
                setFinishing(false);
                return;
            }

            // (B) call recommend
            const mlBase = buildMLPayload();
            const recommendPayload = {
                ...mlBase,
                seed_items: seedItems.map((x) => Number(x)), // đảm bảo number nếu ML cần
            };

            const recRes = await mlRecommendApi.getRecommend(recommendPayload);
            const recData = recRes?.DT || [];

            const normalized = recData.map((x) => ({
                courseId: x.id,       
                score: x.score,
            }));

            localStorage.setItem("recommendResult", JSON.stringify(normalized));

            notification.success({
                message: "Success",
                description: "Preferences saved. Generating recommendations...",
            });

            navigate("/recommendations");
        } catch (err) {
            console.error(err);
            notification.error({ message: "Error", description: "Failed to finish onboarding." });
        } finally {
            setFinishing(false);
        }
    };

    const getOptionsForQuestion = (q) => {
        if (q.id === "q5" && q.dynamicOptions) {
            return candidateOptions; // [{label, value}]
        }
        return q.options || []; // q1–q4
    };


    // -------- RENDER QUESTION --------
    const renderContent = () => {
        const q = currentQuestion;
        const qid = q.id;
        const selected = answersByQuestion[qid] || [];

        if (q.type === "multi") {
            const options = getOptionsForQuestion(q);

            if (q.id === "q5") {
                if (loadingCandidates) {
                    return (
                        <div style={{ paddingTop: 40, textAlign: "center" }}>
                            <Spin size="large" />
                            <div style={{ marginTop: 12, color: "#888" }}>
                                Preparing suggestions...
                            </div>
                        </div>
                    );
                }

                if (!options.length) {
                    return <Text type="secondary">No suggestions available.</Text>;
                }

                return (
                    <div className="onb-options-grid">
                        {options.map((opt) => (
                            <TagOption
                                key={opt.value}
                                label={opt.label}
                                selected={selected.includes(opt.value)}
                                onClick={() => toggleSelect(qid, opt.value)}
                            />
                        ))}

                        <div className="onb-selected-count">
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {selected.length}/5 selected
                            </Text>
                        </div>
                    </div>
                );
            }

            // q1–q4 (options là string)
            return (
                <div className="onb-options-grid">
                    {options.map((opt) => (
                        <TagOption
                            key={opt}
                            label={opt}
                            selected={selected.includes(opt)}
                            onClick={() => toggleSelect(qid, opt)}
                        />
                    ))}
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

    if (finishing) {
        return (
            <div className="onboarding-wrapper">
                <div className="loading-box">
                    <Spin size="large" />
                    <p>Generating recommendations...</p>
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
                        {currentStep === 5
                            ? "Select exactly 5 dishes"
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

                        {currentStep < 4 && (
                            <button className="footer-skip" onClick={handleSkip}>
                                Skip
                            </button>
                        )}

                        <button
                            className="footer-nav-btn primary"
                            disabled={currentStep === 5 && (answersByQuestion.q5 || []).length < 5}
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