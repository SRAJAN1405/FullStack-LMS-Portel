import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    // console.log(courseId, "courseId");
    //step 1 fetch the user course progress
    let courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    }).populate("courseId");
    const courseDetails = await Course.findById(courseId).populate("lectures");
    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }
    //Step 2 if no progress found th en return course details with empty progess
    if (!courseProgress) {
      return res
        .status(200)
        .json({ courseDetails, progress: [], completed: false });
    }

    //Step 3 if progress found then return course details with progress
    return res.status(200).json({
      courseDetails,
      progress: courseProgress.lectureProgress,
      completed: courseProgress.completed,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    //fetch or create course progress
    let courseProgress = await CourseProgress.findOne({ userId, courseId });
    if (!courseProgress) {
      //if no progress exist ,create a new record
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }
    //find the lecture progress in the course progress
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      //if lecture progress found then update its viewed status to be true
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      //add new lecture progress if not found
      courseProgress.lectureProgress.push({ lectureId, viewed: true });
    }
    //if all lecture are viewed then mark course as completed
    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;

    const course = await Course.findById(courseId);

    if (course.lectures.length === lectureProgressLength) {
      courseProgress.completed = true;
    }

    await courseProgress.save();

    return res
      .status(200)
      .json({ message: "Lecture progress updated successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    let courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      //if no progress exist ,create a new record
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }
    // console.log(courseProgress, "courseProgress");
    const course = await Course.findById(courseId); // Fetch course without population
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    // Populate course progress with all lectures as `viewed: true`
    const lectureProgress = course.lectures.map((lecture) => ({
      lectureId: lecture._id, // Assuming lecture._id is the unique identifier for the lecture
      viewed: true, // Marking all lectures as viewed
    }));
    courseProgress.lectureProgress = lectureProgress;
    courseProgress.completed = true;
    await courseProgress.save();
    // console.log("courseProgress", courseProgress);
    return res
      .status(200)
      .json({ message: "Course marked as completed successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = false)
    );
    courseProgress.completed = false;
    await courseProgress.save();
    return res
      .status(200)
      .json({ message: "Course marked as incompleted successfully" });
  } catch (error) {
    console.log(error);
  }
};
