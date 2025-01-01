import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { toast } from "sonner";

const CourseProgress = () => {
  const params = useParams();
  const [currentLecture, setCurrentLecture] = useState(null);
  const courseId = params.courseId;

  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();

  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();

  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  useEffect(() => {
    if (completedSuccess) {
      toast.success(markCompleteData.message);
    }
  }, [completedSuccess]);

  useEffect(() => {
    if (inCompletedSuccess) {
      toast.success(markInCompleteData.message);
    }
  }, [inCompletedSuccess]);

  // console.log(data, "data".replace,isLoading, "isLoading",isError, "isError");
  // console.log(currentLecture, "currentLecture");
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed } = data;

  //initialize first lecture when course is loaded
  const initialLecture = currentLecture || courseDetails?.lectures[0];

  const courseTitle = courseDetails?.courseTitle;

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  //Handle current selected lecture to watch
  const handleSelectLecture = (lecture) => {
    // console.log(lecture, "lecture");
    setCurrentLecture(lecture);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };
  //control video player functions starts
  const handleSkip = (time) => {
    const video = document.getElementById("video-player");
    if (video) {
      video.currentTime = Math.max(0, video.currentTime + time); // Skip forward/backward
    }
  };

  const handlePlaybackRateChange = (rate) => {
    const video = document.getElementById("video-player");
    if (video) {
      video.playbackRate = rate; // Adjust playback speed
    }
  };
  //ends

  //handle course completion
  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
    refetch();
  };

  //handle incomplete course
  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
    refetch();
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 mt-8">
        {/* Display course Name */}
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold ">{courseTitle}</h1>
          <Button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            variant={completed ? "outline" : "default"}
          >
            {completed ? (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Completed</span>
              </div>
            ) : (
              "Mark all as Complete"
            )}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Video section */}
          <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
            <div>
              <div className="video-container">
                <video
                  id="video-player"
                  src={currentLecture?.videoUrl || initialLecture.videoUrl}
                  controls
                  className="w-full h-auto md:rounded-lg"
                  onEnded={() => {
                    handleLectureProgress(
                      currentLecture?._id || initialLecture._id
                    );
                  }}
                ></video>
                {/* Custom Controls */}
                <div className="video-controls mt-2 flex justify-center gap-2 md:gap-4">
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-1 sm:p-2 bg-gray-200 rounded-lg hover:bg-gray-300  dark:bg-gray-800 text-xs sm:text-sm"
                  >
                    -10s
                  </button>
                  <button
                    onClick={() => handleSkip(10)}
                    className="p-1 sm:p-2 bg-gray-200 rounded-lg hover:bg-gray-300  dark:bg-gray-800 text-xs sm:text-sm"
                  >
                    +10s
                  </button>
                  <button
                    onClick={() => handlePlaybackRateChange(1)}
                    className="p-1 sm:p-2 bg-gray-200 rounded-lg hover:bg-gray-300  dark:bg-gray-800 text-xs sm:text-sm"
                  >
                    Normal Speed
                  </button>
                  <button
                    onClick={() => handlePlaybackRateChange(1.25)}
                    className="p-1 sm:p-2 bg-gray-200 rounded-lg hover:bg-gray-300   dark:bg-gray-800 text-xs sm:text-sm"
                  >
                    1.25x Speed
                  </button>
                  <button
                    onClick={() => handlePlaybackRateChange(1.5)}
                    className="p-1 sm:p-2 bg-gray-200 rounded-lg hover:bg-gray-300   dark:bg-gray-800 text-xs  sm:text-sm"
                  >
                    1.5x Speed
                  </button>
                </div>
              </div>
            </div>
            {/* Display current watching lecture title  */}
            <div className="mt-2">
              {" "}
              <h3 className="font-medium text-lg ">
                {`Lecture ${
                  courseDetails?.lectures.findIndex(
                    (lec) =>
                      lec._id === currentLecture?._id || initialLecture._id
                  ) + 1
                } : ${
                  currentLecture?.lectureTitle || initialLecture.lectureTitle
                }`}
              </h3>
            </div>
          </div>
          {/* Lecture Sidebar */}
          <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
            <h2 className="font-semibold text-xl mb-4">Course Lecture</h2>
            <div className="flex-1 overflow-y-auto">
              {courseDetails?.lectures.map((lecture) => (
                <Card
                  key={lecture._id}
                  className={`mb-3 hover:cursor-pointer transition transform ${
                    lecture._id === currentLecture?._id
                      ? "bg-gray-200 dark:bg-gray-800"
                      : ""
                  }`}
                  onClick={() => handleSelectLecture(lecture)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      {isLectureCompleted(lecture._id) ? (
                        <CheckCircle2
                          size={24}
                          className="text-green-500 mr-2"
                        />
                      ) : (
                        <CirclePlay className="text-gray-500 mr-2" />
                      )}
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {lecture.lectureTitle}
                        </CardTitle>
                      </div>
                    </div>

                    {isLectureCompleted(lecture._id) && (
                      <Badge
                        variant={"outline"}
                        className="bg-green-200 text-green-600 "
                      >
                        Completed
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseProgress;
