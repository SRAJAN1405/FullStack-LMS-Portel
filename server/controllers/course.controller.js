import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";

import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { courseTitle, category } = req.body;
    if (!courseTitle || !category) {
      return res.status(400).json({
        message: "Course title and category is required.",
      });
    }

    const course = await Course.create({
      courseTitle,
      category,
      creator: req.id,
    });

    return res.status(201).json({
      course,
      message: "Course created.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create course",
    });
  }
};
export const searchCourse = async (req, res) => {
  //to study more about this controller function.....
  try {
    const { query = "", categories = [], sortByPrice = "" } = req.query;
    //create search query
    const searchCriteria = {
      isPublished: true,
      $or: [
        { courseTitle: { $regex: query, $options: "i" } },
        { subtitle: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    };

    //if categories are provided
    if (categories.length > 0) {
      searchCriteria.category = { $in: categories };
    }

    //define sort criteria
    const sortOptions = {};
    if (sortByPrice === "low") {
      sortOptions.coursePrice = 1; //sort in price in ascending order
    } else if (sortByPrice === "high") {
      sortOptions.coursePrice = -1; //sort in price in descending order
    }
    let courses = await Course.find(searchCriteria)
      .populate({ path: "creator", select: "name photoUrl" })
      .sort(sortOptions);
    return res.status(200).json({
      success: true,
      courses: courses || [],
    });
  } catch (error) {
    console.log(error);
  }
};
export const getCreatorCourses = async (req, res) => {
  try {
    const userId = req.id;
    const courses = await Course.find({ creator: userId });
    if (!courses) {
      return res.status(404).json({
        message: "No courses found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get all courses",
    });
  }
};
//original code
export const editCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    // console.log(courseId, "courseId");

    const {
      courseTitle,
      subtitle,
      description,
      category,
      courseLevel,
      coursePrice,
    } = req.body;
    const thumbnail = req.file;

    let course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    let courseThumbnail = course.courseThumbnail; // Default to existing thumbnail

    if (thumbnail) {
      if (course.courseThumbnail) {
        const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
        await deleteMediaFromCloudinary(publicId); // Delete old thumbnail from cloudinary
      }
      // Upload new thumbnail to cloudinary
      const uploadedThumbnail = await uploadMedia(thumbnail.path);
      courseThumbnail = uploadedThumbnail?.secure_url; // Update thumbnail URL
    }

    // Prepare updated data with fallback to existing data
    const updateData = {
      courseTitle: courseTitle ?? course.courseTitle,
      subtitle: subtitle ?? course.subtitle,
      description: description ?? course.description,
      category: category ?? course.category,
      courseLevel: courseLevel ?? course.courseLevel,
      coursePrice: coursePrice ?? course.coursePrice,
      courseThumbnail: courseThumbnail,
    };

    // Update the course in the database
    course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true, // Return the updated document
    });

    return res.status(200).json({
      course,
      message: "Course updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit course",
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    // console.log(course, "query get");
    return res.status(200).json({
      course,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get course",
    });
  }
};

//creating lecture
export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;
    // console.log(lectureTitle, courseId, "lectureTitle, courseId");
    if (!lectureTitle || !courseId) {
      return res.status(400).json({
        message: "Lecture title is required.",
      });
    }

    //create lecture
    const lecture = await Lecture.create({
      lectureTitle,
    });
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course) {
      course.lectures.push(lecture._id);
      await course.save(); //do some work on this statement
    }
    return res.status(201).json({
      lecture,
      message: "Lecture created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create lecture",
    });
  }
};

//getting all lectures of a course
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    // console.log(courseId, "courseId");
    const course = await Course.findById(courseId).populate("lectures");
    // populate: This is a Mongoose function used to replace a referenced field (in this case, lectures) with the actual documents it refers to.
    //replacing array of lecture refernce with aray of whole lecture documents which are referred respectively....

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    return res.status(200).json({
      lectures: course.lectures,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lectures",
    });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { lectureTitle, videoInfo, isPreviewFree } = req.body;
    const { courseId, lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    //update lecture

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoInfo && videoInfo.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
    if (videoInfo && videoInfo.publicId) lecture.publicId = videoInfo.publicId;
    if (isPreviewFree) lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    //Ensure that the course is still having lecture id if was not already having...
    const course = await Course.findById(courseId);

    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }
    return res.status(200).json({
      lecture,
      message: "Lecture updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to edit lecture",
    });
  }
};

export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    // console.log(lectureId, "lectureId");
    const lecture = await Lecture.findByIdAndDelete(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Lecture not found",
      });
    }

    //delete lecture from cloudinary
    if (lecture.publicId) {
      await deleteMediaFromCloudinary(lecture.publicId);
    }

    //removing the lecture reference from associated course
    const course = await Course.findOneAndUpdate(
      { lectures: lectureId }, //find the course which contains the lecture
      { $pull: { lectures: lectureId } } //remove the lecture id from the lectures array
    );
    return res.status(200).json({
      message: "Lecture Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to remove lecture",
    });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({
        message: "Failed to get lecture by id",
      });
    }

    return res.status(200).json({
      lecture,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get lecture by id,",
    });
  }
};

//publish  unpublish course logic
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { publish } = req.query; //true,false
    const course = await Course.findById(courseId);
    // console.log(publish, "publish");
    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }
    //publish based on the query parameter
    course.isPublished = publish === "true";
    await course.save();
    // console.log(course.isPublished, "course.isPublished");
    const statusMessage = course.isPublished
      ? "Awesome,Course Published Successfully"
      : "Course Unpublished Successfully";

    return res.status(200).json({
      message: ` ${statusMessage}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update status",
    });
  }
};

export const getPublishedCourse = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoUrl",
    });
    // console.log(courses, "courses");
    if (!courses) {
      return res.status(404).json({
        message: "No published courses found",
      });
    }
    return res.status(200).json({
      courses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get published courses",
    });
  }
};
