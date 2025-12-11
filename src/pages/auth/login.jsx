import userApi from "../../routers/userApi";
import { Form, Input, Button, Typography, notification } from "antd";
import { GoogleOutlined, AppleFilled, FacebookFilled } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./auth.css";

const { Title, Text: AntText } = Typography;

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isLogin = location.pathname.includes("login");

    const onFinish = async (values) => {
        const { email, password } = values;
        const res = await userApi.login(email, password);

        if (res?.EC === 0) {
            localStorage.setItem("accessToken", res.DT.accessToken);

            notification.success({
                message: "Login",
                description: res.EM || "Login successfully!",
            });

            navigate("/onboarding");
        } else {
            notification.error({
                message: "Login",
                description: res?.EM ?? "Something went wrong!",
            });
        }
    };

    return (
        <div className="auth-wrapper">

            <div className="auth-top-right">
                <button
                    className={`auth-tab-btn ${!isLogin ? "active" : ""}`}
                    onClick={() => navigate("/auth/register")}
                >
                    Sign up
                </button>

                <button
                    className={`auth-tab-btn ${isLogin ? "active" : ""}`}
                    onClick={() => navigate("/auth/login")}
                >
                    Sign in
                </button>
            </div>

            <div className="auth-left-info">
                <h2 className="auth-logo">TasteMate</h2>
                <a className="auth-email" href="mailto:support@tastemate.ai">
                    support@tastemate.ai
                </a>
            </div>

            <div className="auth-card">
                <Title level={3} className="auth-title">Welcome Back</Title>
                <AntText className="auth-subtitle">
                    Please enter your credentials to continue
                </AntText>

                <Form layout="vertical" onFinish={onFinish} className="auth-form">
                    <Form.Item name="email" rules={[{ required: true }]}>
                        <Input size="large" placeholder="Email" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true }]}>
                        <Input.Password size="large" placeholder="Password" />
                    </Form.Item>

                    <AntText className="auth-subtle-text">
                        Having trouble signing in?
                    </AntText>

                    <Button type="primary" htmlType="submit" size="large" className="auth-submit-btn">
                        Sign in
                    </Button>

                    <div className="auth-divider">Or Sign in with</div>

                    <div className="auth-social-buttons">
                        <Button size="large" icon={<GoogleOutlined />}>Google</Button>
                        <Button size="large" icon={<FacebookFilled />}>Facebook</Button>
                    </div>

                    <div className="auth-bottom-text">
                        Don’t have an account? <a href="#">Request Now</a>
                    </div>
                </Form>

                <div className="auth-footer">
                    Copyright © 2025 TasteMate | Privacy Policy
                </div>
            </div>
        </div>
    );
}

export default LoginPage;