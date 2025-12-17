import { Card } from "antd";
import "./courseCard.css";
import { HeartOutlined } from "@ant-design/icons";

const CourseCard = ({ name, imageUrl }) => {
  return (
    <div className="course-card">
      <div className="course-card-inner">
        <HeartOutlined className="course-card-badge" />

        <div className="course-card-image-wrapper">
          <img
            src={imageUrl}
            alt={name}
            className="course-card-image"
          />
        </div>

        <div className="course-card-name">{name}</div>
      </div>
    </div>
  );
};

export default CourseCard;