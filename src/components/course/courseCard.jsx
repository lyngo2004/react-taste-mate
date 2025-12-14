import { Card } from "antd";
import "./courseCard.css";
import { HeartOutlined } from '@ant-design/icons';

const CourseCard = ({ name, imageUrl, accuracy }) => {
  return (
    <div className="course-card">
      <div className="course-card-inner">
        {/* <div className="course-card-badge">{accuracy}% match</div> */}
        <HeartOutlined className="course-card-badge"></HeartOutlined>

        <div className="course-card-image-wrapper">
          <img src={imageUrl} alt={name} className="course-card-image" />
        </div>

        <div className="course-card-name">{name}</div>
      </div>
    </div>
  );
};

export default CourseCard;
