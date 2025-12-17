import userApi from "../../routers/userApi";
import { Form, Input, Button, Typography, notification } from "antd";
import { GoogleOutlined, FacebookFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const { Title, Text: AntText } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        const { name, email, password } = values;

        const res = await userApi.register(name, email, password);

        if (res?.EC === 0 || res?.success) {
            notification.success({
                message: "Register",
                description: res.EM || res.message || "Account created successfully!",
            });
            navigate("/login");
        } else {
            notification.error({
                message: "Register",
                description: res?.EM ?? res?.message ?? "Something went wrong!",
            });
        }
    };

    return (
        <div className="auth-wrapper">

            {/* Top right switch */}
            <div className="auth-top-right">
                <button
                    className="auth-tab-btn active"
                    onClick={() => navigate("/register")}
                >
                    Sign up
                </button>

                <button
                    className="auth-tab-btn"
                    onClick={() => navigate("/login")}
                >
                    Sign in
                </button>
            </div>

            {/* Left info */}
            <div className="auth-left-info">
                <h2 className="auth-logo">TasteMate</h2>
                <a className="auth-email" href="mailto:support@tastemate.ai">
                    support@tastemate.ai
                </a>
            </div>

            {/* Register card */}
            <div className="auth-card">
                <Title level={3} className="auth-title">
                    Create your account
                </Title>

                <AntText className="auth-subtitle">
                    Join TasteMate to get personalized meal recommendations
                </AntText>

                <Form layout="vertical" onFinish={onFinish} className="auth-form">
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: "Please enter your full name" }]}
                    >
                        <Input size="large" placeholder="Full name" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Please enter your email" },
                            { type: "email", message: "Invalid email address" },
                        ]}
                    >
                        <Input size="large" placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Please enter your password" }]}
                    >
                        <Input.Password size="large" placeholder="Password" />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        className="auth-submit-btn"
                    >
                        Sign up
                    </Button>

                    <div className="auth-divider">Or sign up with</div>

                    <div className="auth-social-buttons">
                        <Button size="large" icon={<GoogleOutlined />}>
                            Google
                        </Button>
                        <Button size="large" icon={<FacebookFilled />}>
                            Facebook
                        </Button>
                    </div>

                    <div className="auth-bottom-text">
                        Already have an account?{" "}
                        <span
                            className="auth-link"
                            onClick={() => navigate("/auth/login")}
                        >
                            Sign in
                        </span>
                    </div>
                </Form>

                <div className="auth-footer">
                    Copyright © 2025 TasteMate | Privacy Policy
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
